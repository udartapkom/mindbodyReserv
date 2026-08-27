import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PhoneCountry } from '../phone-country.enum';
import { UserRole } from '../user-role.enum';
import { UserTariff } from '../user-tariff.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'first_name', type: 'varchar', length: 100, nullable: true })
  firstName: string | null;

  @Column({ name: 'last_name', type: 'varchar', length: 100, nullable: true })
  lastName: string | null;

  @Column({ unique: true })
  phone: string;

  @Column({
    name: 'phone_country',
    type: 'enum',
    enum: PhoneCountry,
    nullable: true,
  })
  phoneCountry: PhoneCountry | null;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ type: 'enum', enum: UserTariff, default: UserTariff.FREE })
  tariff: UserTariff;

  @Column({ name: 'tariff_expires_at', type: 'timestamptz', nullable: true })
  tariffExpiresAt: Date | null;

  @Column({ name: 'avatar_url', type: 'varchar', length: 2048, nullable: true })
  avatarUrl: string | null;

  @Column({ name: 'phone_verified_at', type: 'timestamptz', nullable: true })
  phoneVerifiedAt: Date | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'notify_support_replies', default: true })
  notifySupportReplies: boolean;

  @Column({ name: 'notify_new_materials', default: false })
  notifyNewMaterials: boolean;

  @Column({ name: 'notify_daily_quote', default: false })
  notifyDailyQuote: boolean;

  @Column({ name: 'notify_new_insights', default: false })
  notifyNewInsights: boolean;

  @Column({ name: 'notify_tariff_expiry', default: true })
  notifyTariffExpiry: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
