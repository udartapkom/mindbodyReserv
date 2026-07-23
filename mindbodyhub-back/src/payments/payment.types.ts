export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  CANCELED = 'canceled',
  FAILED = 'failed',
  CHARGEBACK = 'chargeback',
}

export enum PaymentProvider {
  PLATEGA = 'platega',
}

export type PaymentDto = {
  id: string;
  userId: string;
  tariffType: string;
  tariffId: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: PaymentProvider;
  providerTransactionId: string | null;
  paymentUrl: string | null;
  description: string;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreatePaymentResponseDto = {
  id: string;
  paymentUrl: string;
  status: PaymentStatus;
  expiresIn: string | null;
  amount: number;
  currency: string;
  tariffType: string;
};

/** Platega transaction statuses */
export type PlategaPaymentStatus =
  | 'PENDING'
  | 'CANCELED'
  | 'CONFIRMED'
  | 'CHARGEBACKED';
