import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tariffs')
export class Tariff {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** English slug matching marketing title, e.g. trial / popular / vip */
  @Column({ unique: true, length: 50 })
  type: string;

  @Column({ length: 100 })
  title: string;

  @Column({ name: 'title_color', type: 'varchar', length: 32, nullable: true })
  titleColor: string | null;

  @Column({ length: 50 })
  price: string;

  /** Integer rubles for Platega create; preferred over parsing `price` */
  @Column({ name: 'price_amount', type: 'int', nullable: true })
  priceAmount: number | null;

  @Column({ length: 50 })
  period: string;

  /** Access duration in days after payment / renewal */
  @Column({ name: 'duration_days', type: 'int', default: 30 })
  durationDays: number;

  @Column({ name: 'sub_title', length: 200 })
  subTitle: string;

  @Column({ type: 'text', array: true, default: '{}' })
  description: string[];

  @Column({ length: 512 })
  image: string;

  @Column({ name: 'image_alt', length: 255 })
  imageAlt: string;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
