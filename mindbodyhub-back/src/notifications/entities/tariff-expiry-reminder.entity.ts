import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('tariff_expiry_reminders')
@Unique('uq_tariff_expiry_reminders_user_days_expires', [
  'userId',
  'daysBefore',
  'expiresAt',
])
export class TariffExpiryReminder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_tariff_expiry_reminders_user_id')
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'days_before', type: 'int' })
  daysBefore: number;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @CreateDateColumn({ name: 'sent_at', type: 'timestamptz' })
  sentAt: Date;
}
