import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tariff_comparison_rows')
export class TariffComparisonRow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  feature: string;

  /** Map of tariff.type → included flag, e.g. { trial: true, vip: false } */
  @Column({ type: 'jsonb', default: () => "'{}'" })
  included: Record<string, boolean>;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
