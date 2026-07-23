import { Payment } from './entities/payment.entity';
import { PaymentDto } from './payment.types';

export function toPaymentDto(payment: Payment): PaymentDto {
  return {
    id: payment.id,
    userId: payment.userId,
    tariffType: payment.tariffType,
    tariffId: payment.tariffId,
    amount: payment.amount,
    currency: payment.currency,
    status: payment.status,
    provider: payment.provider,
    providerTransactionId: payment.providerTransactionId,
    paymentUrl: payment.paymentUrl,
    description: payment.description,
    paidAt: payment.paidAt?.toISOString() ?? null,
    createdAt: payment.createdAt.toISOString(),
    updatedAt: payment.updatedAt.toISOString(),
  };
}
