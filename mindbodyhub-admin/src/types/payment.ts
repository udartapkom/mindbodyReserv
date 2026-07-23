export const PaymentStatus = {
  PENDING: 'pending',
  PAID: 'paid',
  CANCELED: 'canceled',
  FAILED: 'failed',
  CHARGEBACK: 'chargeback',
} as const;

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export type Payment = {
  id: string;
  userId: string;
  tariffType: string;
  tariffId: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: string;
  providerTransactionId: string | null;
  paymentUrl: string | null;
  description: string;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
};
