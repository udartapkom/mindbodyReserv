import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isUserTariff, UserTariff } from '../common/tariff/access.types';
import { TariffsService } from '../tariffs/tariffs.service';
import { UsersService } from '../users/users.service';
import { PlategaCallbackDto } from './dto/platega-callback.dto';
import { Payment } from './entities/payment.entity';
import { toPaymentDto } from './payment.mapper';
import {
  CreatePaymentResponseDto,
  PaymentProvider,
  PaymentStatus,
} from './payment.types';
import { parsePriceAmount } from './payment.utils';
import { PlategaClient } from './platega.client';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
    private readonly tariffsService: TariffsService,
    private readonly usersService: UsersService,
    private readonly plategaClient: PlategaClient,
    private readonly config: ConfigService,
  ) {}

  findAll(): Promise<Payment[]> {
    return this.paymentsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  findById(id: string): Promise<Payment | null> {
    return this.paymentsRepository.findOne({ where: { id } });
  }

  findByUserId(userId: string): Promise<Payment[]> {
    return this.paymentsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  findByProviderTransactionId(
    providerTransactionId: string,
  ): Promise<Payment | null> {
    return this.paymentsRepository.findOne({
      where: { providerTransactionId },
    });
  }

  /** Fixed amounts for admin test payments (RUB): trial / popular / vip */
  private static readonly TEST_AMOUNTS: Record<string, number> = {
    [UserTariff.TRIAL]: 1,
    [UserTariff.POPULAR]: 2,
    [UserTariff.VIP]: 3,
  };

  async createForUser(
    userId: string,
    tariffType: string,
  ): Promise<CreatePaymentResponseDto> {
    return this.createPayment(userId, tariffType, { mode: 'purchase' });
  }

  async createTestForAdmin(
    userId: string,
    tariffType: string,
  ): Promise<CreatePaymentResponseDto> {
    const amount = PaymentsService.TEST_AMOUNTS[tariffType];
    if (!amount) {
      throw new BadRequestException('Тестовый платёж доступен только для paid-тарифов');
    }
    return this.createPayment(userId, tariffType, { mode: 'test', amount });
  }

  private async createPayment(
    userId: string,
    tariffType: string,
    options: { mode: 'purchase' } | { mode: 'test'; amount: number },
  ): Promise<CreatePaymentResponseDto> {
    const user = await this.usersService.findById(userId);
    if (!user || !user.isActive) {
      throw new BadRequestException('Пользователь недоступен для оплаты');
    }

    const tariff = await this.tariffsService.findByType(tariffType);
    if (!tariff || !tariff.isActive) {
      throw new BadRequestException('Тариф не найден или неактивен');
    }

    const amount =
      options.mode === 'test'
        ? options.amount
        : parsePriceAmount(tariff.price);
    if (!amount) {
      throw new BadRequestException(
        `Некорректная цена тарифа: "${tariff.price}"`,
      );
    }

    const description =
      options.mode === 'test'
        ? `ТЕСТ: тариф ${tariff.title} (${tariff.type}) — ${amount} ₽ — MindBodyHub`
        : `Тариф ${tariff.title} (${tariff.type}) — MindBodyHub`;

    const payment = await this.paymentsRepository.save(
      this.paymentsRepository.create({
        userId: user.id,
        tariffType: tariff.type,
        tariffId: tariff.id,
        amount,
        currency: 'RUB',
        status: PaymentStatus.PENDING,
        provider: PaymentProvider.PLATEGA,
        providerTransactionId: null,
        paymentUrl: null,
        description,
        rawCallback: null,
        paidAt: null,
      }),
    );

    const successUrl = this.config.getOrThrow<string>('PLATEGA_SUCCESS_URL');
    const failUrl = this.config.getOrThrow<string>('PLATEGA_FAIL_URL');

    try {
      const created = await this.plategaClient.createTransaction({
        amount,
        currency: 'RUB',
        description,
        returnUrl: successUrl,
        failedUrl: failUrl,
        payload: payment.id,
        userId: user.id,
        userName: user.phone,
      });

      payment.providerTransactionId = created.transactionId;
      payment.paymentUrl = created.paymentUrl;
      await this.paymentsRepository.save(payment);

      return {
        id: payment.id,
        paymentUrl: created.paymentUrl,
        status: payment.status,
        expiresIn: created.expiresIn,
        amount: payment.amount,
        currency: payment.currency,
        tariffType: payment.tariffType,
      };
    } catch (error) {
      payment.status = PaymentStatus.FAILED;
      await this.paymentsRepository.save(payment);
      throw error;
    }
  }

  async handlePlategaCallback(
    dto: PlategaCallbackDto,
    rawBody: Record<string, unknown>,
  ): Promise<{ success: true }> {
    let payment =
      (await this.findByProviderTransactionId(dto.id)) ??
      (dto.payload ? await this.findById(dto.payload) : null);

    if (!payment) {
      this.logger.warn(
        `Platega callback for unknown transaction ${dto.id} payload=${dto.payload ?? ''}`,
      );
      // Acknowledge to stop retries for unknown txs we cannot process
      return { success: true };
    }

    payment.rawCallback = rawBody;

    if (
      payment.status === PaymentStatus.PAID ||
      payment.status === PaymentStatus.CHARGEBACK
    ) {
      await this.paymentsRepository.save(payment);
      return { success: true };
    }

    if (!payment.providerTransactionId) {
      payment.providerTransactionId = dto.id;
    }

    // Prefer provider status when available
    let providerStatus = dto.status;
    try {
      const remote = await this.plategaClient.getTransactionStatus(dto.id);
      if (remote.status) {
        providerStatus = remote.status;
      }
    } catch (error) {
      this.logger.warn(
        `Could not verify Platega status for ${dto.id}: ${String(error)}`,
      );
    }

    if (providerStatus === 'CONFIRMED') {
      if (
        typeof dto.amount === 'number' &&
        Math.round(dto.amount) !== payment.amount
      ) {
        this.logger.error(
          `Amount mismatch payment=${payment.id} expected=${payment.amount} got=${dto.amount}`,
        );
        payment.status = PaymentStatus.FAILED;
        await this.paymentsRepository.save(payment);
        return { success: true };
      }

      await this.markPaid(payment);
      return { success: true };
    }

    if (providerStatus === 'CANCELED') {
      payment.status = PaymentStatus.CANCELED;
      await this.paymentsRepository.save(payment);
      return { success: true };
    }

    if (providerStatus === 'CHARGEBACKED') {
      payment.status = PaymentStatus.CHARGEBACK;
      await this.paymentsRepository.save(payment);
      this.logger.warn(
        `Chargeback for payment=${payment.id} user=${payment.userId} — tariff not auto-reverted`,
      );
      return { success: true };
    }

    await this.paymentsRepository.save(payment);
    return { success: true };
  }

  private async markPaid(payment: Payment): Promise<Payment> {
    payment.status = PaymentStatus.PAID;
    payment.paidAt = new Date();
    const saved = await this.paymentsRepository.save(payment);

    if (!isUserTariff(payment.tariffType) || payment.tariffType === UserTariff.FREE) {
      this.logger.error(
        `Paid payment ${payment.id} has invalid tariffType=${payment.tariffType}`,
      );
      return saved;
    }

    await this.usersService.adminUpdateUser(payment.userId, {
      tariff: payment.tariffType,
    });

    this.logger.log(
      `Payment ${payment.id} paid — user ${payment.userId} tariff=${payment.tariffType}`,
    );

    return saved;
  }

  toDto(payment: Payment) {
    return toPaymentDto(payment);
  }

  async getOwnedOrThrow(userId: string, paymentId: string): Promise<Payment> {
    const payment = await this.findById(paymentId);
    if (!payment || payment.userId !== userId) {
      throw new NotFoundException('Платёж не найден');
    }
    return payment;
  }
}
