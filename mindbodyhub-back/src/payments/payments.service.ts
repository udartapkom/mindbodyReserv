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
import { VkNotifyService } from '../notifications/vk-notify.service';
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
    private readonly vkNotify: VkNotifyService,
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
        : tariff.priceAmount && tariff.priceAmount > 0
          ? tariff.priceAmount
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

    // Already finalized chargeback — acknowledge only
    if (payment.status === PaymentStatus.CHARGEBACK) {
      await this.paymentsRepository.save(payment);
      return { success: true };
    }

    // Paid payment may still receive CHARGEBACKED after refund
    if (payment.status === PaymentStatus.PAID) {
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

      if (providerStatus === 'CHARGEBACKED') {
        await this.markChargeback(payment, rawBody);
      } else {
        await this.paymentsRepository.save(payment);
      }
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
      // Platega callback/status amount often includes merchant commission
      // (e.g. tariff 99 ₽ → amount 112.86 with comission 13.86). Do not fail
      // a verified CONFIRMED payment over that mismatch.
      if (
        typeof dto.amount === 'number' &&
        Math.round(dto.amount) !== payment.amount
      ) {
        this.logger.warn(
          `Amount differs payment=${payment.id} expected=${payment.amount} got=${dto.amount} — accepting CONFIRMED`,
        );
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
      await this.markChargeback(payment, rawBody);
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
      void this.notifyPayment(saved, 'paid');
      return saved;
    }

    const user = await this.usersService.findById(payment.userId);
    if (!user) {
      this.logger.error(
        `Paid payment ${payment.id} user ${payment.userId} not found`,
      );
      void this.notifyPayment(saved, 'paid');
      return saved;
    }

    const tariff = await this.tariffsService.findByType(payment.tariffType);
    if (!tariff) {
      this.logger.error(
        `Paid payment ${payment.id} tariff ${payment.tariffType} not found`,
      );
      await this.usersService.adminUpdateUser(payment.userId, {
        tariff: payment.tariffType,
      });
      void this.notifyPayment(saved, 'paid');
      return saved;
    }

    await this.usersService.adminUpdateUser(payment.userId, {
      tariff: payment.tariffType,
      tariffExpiresAt: this.computeTariffExpiresAt(user, tariff),
    });

    this.logger.log(
      `Payment ${payment.id} paid — user ${payment.userId} tariff=${payment.tariffType}`,
    );

    void this.notifyPayment(saved, 'paid');
    return saved;
  }

  /**
   * Admin-initiated refund via Platega cancel API.
   * Sets status chargeback and revokes tariff if it still matches this payment.
   */
  async refundByAdmin(paymentId: string): Promise<Payment> {
    const payment = await this.findById(paymentId);
    if (!payment) {
      throw new NotFoundException('Платёж не найден');
    }

    if (payment.status === PaymentStatus.CHARGEBACK) {
      return payment;
    }

    if (payment.status !== PaymentStatus.PAID) {
      throw new BadRequestException('Возврат доступен только для оплаченных платежей');
    }

    if (!payment.providerTransactionId) {
      throw new BadRequestException('У платежа нет ID транзакции Platega');
    }

    const support = await this.plategaClient.getCancelSupported(
      payment.providerTransactionId,
    );
    if (!support.supported) {
      throw new BadRequestException(
        support.blockReason?.trim() ||
          'Platega: возврат недоступен (проверьте баланс мерчанта)',
      );
    }

    const cancel = await this.plategaClient.cancelTransaction(
      payment.providerTransactionId,
    );

    payment.rawCallback = {
      ...(payment.rawCallback ?? {}),
      adminRefund: {
        at: new Date().toISOString(),
        cancelSupported: support,
        cancel,
      },
    };

    if (cancel.manualControlRequired && !cancel.accepted) {
      await this.paymentsRepository.save(payment);
      throw new BadRequestException(
        cancel.message?.trim() ||
          'Platega требует ручную обработку возврата — обратитесь в поддержку Platega',
      );
    }

    if (!cancel.accepted) {
      await this.paymentsRepository.save(payment);
      throw new BadRequestException(
        cancel.message?.trim() || 'Platega не приняла запрос на возврат',
      );
    }

    return this.markChargeback(payment, payment.rawCallback ?? {});
  }

  private async markChargeback(
    payment: Payment,
    rawBody: Record<string, unknown>,
  ): Promise<Payment> {
    payment.status = PaymentStatus.CHARGEBACK;
    payment.rawCallback = rawBody;
    const saved = await this.paymentsRepository.save(payment);

    await this.revokeTariffIfMatchesPayment(saved);

    this.logger.warn(
      `Chargeback/refund for payment=${saved.id} user=${saved.userId}`,
    );
    void this.notifyPayment(saved, 'chargeback');
    return saved;
  }

  /** Revoke access only if user still has the tariff from this payment */
  private async revokeTariffIfMatchesPayment(payment: Payment): Promise<void> {
    if (!isUserTariff(payment.tariffType) || payment.tariffType === UserTariff.FREE) {
      return;
    }

    const user = await this.usersService.findById(payment.userId);
    if (!user) {
      return;
    }

    if (user.tariff !== payment.tariffType) {
      this.logger.warn(
        `Refund payment=${payment.id}: user tariff=${user.tariff} differs from ${payment.tariffType} — not revoked`,
      );
      return;
    }

    await this.usersService.adminUpdateUser(payment.userId, {
      tariff: UserTariff.FREE,
      tariffExpiresAt: null,
    });
    this.logger.log(
      `Refund payment=${payment.id}: user ${payment.userId} tariff → free`,
    );
  }

  /**
   * Same tariff with future expiry → extend from expiry.
   * Otherwise (incl. tariff change) → now + durationDays.
   */
  private computeTariffExpiresAt(
    user: { tariff: string; tariffExpiresAt: Date | null },
    tariff: { durationDays: number; type: string },
  ): Date {
    const now = new Date();
    const durationDays =
      tariff.durationDays && tariff.durationDays > 0 ? tariff.durationDays : 30;

    const sameTariff = user.tariff === tariff.type;
    const currentExpiry = user.tariffExpiresAt
      ? new Date(user.tariffExpiresAt)
      : null;
    const hasFutureExpiry =
      currentExpiry !== null && currentExpiry.getTime() > now.getTime();

    const base =
      sameTariff && hasFutureExpiry ? new Date(currentExpiry) : new Date(now);
    base.setUTCDate(base.getUTCDate() + durationDays);
    return base;
  }

  private async notifyPayment(
    payment: Payment,
    kind: 'paid' | 'chargeback',
  ): Promise<void> {
    const user = await this.usersService.findById(payment.userId);
    const payload = {
      paymentId: payment.id,
      userId: payment.userId,
      userPhone: user?.phone ?? null,
      tariffType: payment.tariffType,
      amount: payment.amount,
      currency: payment.currency,
      providerTransactionId: payment.providerTransactionId,
    };

    if (kind === 'paid') {
      await this.vkNotify.notifyPaymentPaid(payload);
      return;
    }

    await this.vkNotify.notifyPaymentChargeback(payload);
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

  /**
   * Re-fetch status from Platega and apply the same transitions as webhook.
   * Used to recover payments stuck in pending/failed after a missed callback.
   */
  async syncFromProvider(paymentId: string): Promise<Payment> {
    const payment = await this.findById(paymentId);
    if (!payment) {
      throw new NotFoundException('Платёж не найден');
    }

    if (payment.status === PaymentStatus.CHARGEBACK) {
      return payment;
    }

    if (!payment.providerTransactionId) {
      throw new BadRequestException('У платежа нет ID транзакции Platega');
    }

    // Paid: only useful to pick up CHARGEBACKED after refund
    if (payment.status === PaymentStatus.PAID) {
      const remote = await this.plategaClient.getTransactionStatus(
        payment.providerTransactionId,
      );
      if (remote.status === 'CHARGEBACKED') {
        return this.markChargeback(payment, {
          source: 'admin-sync',
          remote,
        });
      }
      return payment;
    }

    const remote = await this.plategaClient.getTransactionStatus(
      payment.providerTransactionId,
    );

    return this.handlePlategaCallback(
      {
        id: payment.providerTransactionId,
        amount: remote.amount ?? payment.amount,
        currency: remote.currency ?? payment.currency,
        status: remote.status,
        payload: payment.id,
      },
      {
        source: 'admin-sync',
        remote,
      },
    ).then(async () => {
      const updated = await this.findById(paymentId);
      if (!updated) {
        throw new NotFoundException('Платёж не найден');
      }
      return updated;
    });
  }
}
