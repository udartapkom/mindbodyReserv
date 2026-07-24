import {
  Body,
  Controller,
  Get,
  Headers,
  Logger,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import type { AuthUser } from '../auth/decorators/current-user.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user-role.enum';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PlategaCallbackDto } from './dto/platega-callback.dto';
import {
  CreatePaymentResponseDto,
  PaymentDto,
} from './payment.types';
import { PaymentsService } from './payments.service';
import { PlategaClient } from './platega.client';

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly plategaClient: PlategaClient,
  ) {}

  @Post('create')
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreatePaymentDto,
  ): Promise<CreatePaymentResponseDto> {
    return this.paymentsService.createForUser(user.id, dto.tariffType);
  }

  /** Admin-only test payment with fixed amounts: trial=1₽, popular=2₽, vip=3₽ */
  @Post('test')
  @Roles(UserRole.ADMIN)
  createTest(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreatePaymentDto,
  ): Promise<CreatePaymentResponseDto> {
    return this.paymentsService.createTestForAdmin(user.id, dto.tariffType);
  }

  @Get('me')
  async findMine(@CurrentUser() user: AuthUser): Promise<PaymentDto[]> {
    const payments = await this.paymentsService.findByUserId(user.id);
    return payments.map((payment) => this.paymentsService.toDto(payment));
  }

  @Get('me/:id')
  async findMineOne(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PaymentDto> {
    const payment = await this.paymentsService.getOwnedOrThrow(user.id, id);
    return this.paymentsService.toDto(payment);
  }

  @Public()
  @Post('webhook/platega')
  async plategaWebhook(
    @Body() dto: PlategaCallbackDto,
    @Headers('x-merchantid') merchantId?: string,
    @Headers('x-secret') secret?: string,
  ): Promise<{ success: true }> {
    if (!this.plategaClient.verifyWebhookHeaders(merchantId, secret)) {
      throw new UnauthorizedException('Invalid Platega webhook credentials');
    }

    this.logger.log(
      `Platega webhook: id=${dto.id} status=${dto.status} amount=${dto.amount}`,
    );

    return this.paymentsService.handlePlategaCallback(
      dto,
      dto as unknown as Record<string, unknown>,
    );
  }

  @Get()
  @Roles(UserRole.ADMIN)
  async findAll(): Promise<PaymentDto[]> {
    const payments = await this.paymentsService.findAll();
    return payments.map((payment) => this.paymentsService.toDto(payment));
  }

  @Post(':id/sync')
  @Roles(UserRole.ADMIN)
  async sync(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PaymentDto> {
    const payment = await this.paymentsService.syncFromProvider(id);
    return this.paymentsService.toDto(payment);
  }

  @Post(':id/refund')
  @Roles(UserRole.ADMIN)
  async refund(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PaymentDto> {
    const payment = await this.paymentsService.refundByAdmin(id);
    return this.paymentsService.toDto(payment);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PaymentDto> {
    const payment = await this.paymentsService.findById(id);
    if (!payment) {
      throw new NotFoundException('Платёж не найден');
    }
    return this.paymentsService.toDto(payment);
  }
}
