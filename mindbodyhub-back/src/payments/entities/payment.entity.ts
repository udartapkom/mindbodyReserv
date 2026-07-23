import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PaymentProvider, PaymentStatus } from '../payment.types';

@Entity('payments')
@Index('IDX_payments_provider_tx_unique', ['providerTransactionId'], {
  unique: true,
  where: '"provider_transaction_id" IS NOT NULL',
})
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'tariff_type', length: 50 })
  tariffType: string;

  @Column({ name: 'tariff_id', type: 'uuid', nullable: true })
  tariffId: string | null;

  @Column({ type: 'int' })
  amount: number;

  @Column({ length: 8, default: 'RUB' })
  currency: string;

  @Index()
  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({ length: 32, default: PaymentProvider.PLATEGA })
  provider: PaymentProvider;

  @Column({
    name: 'provider_transaction_id',
    type: 'varchar',
    length: 128,
    nullable: true,
  })
  providerTransactionId: string | null;

  @Column({ name: 'payment_url', type: 'varchar', length: 2048, nullable: true })
  paymentUrl: string | null;

  @Column({ length: 255 })
  description: string;

  @Column({ name: 'raw_callback', type: 'jsonb', nullable: true })
  rawCallback: Record<string, unknown> | null;

  @Column({ name: 'paid_at', type: 'timestamptz', nullable: true })
  paidAt: Date | null;

  @Index()
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
