import {
  Column,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

/** Singleton row (id = 1) for site-wide editable settings. */
@Entity('site_settings')
export class SiteSettings {
  @PrimaryColumn({ type: 'int', default: 1 })
  id: number;

  @Column({
    name: 'support_telegram_url',
    type: 'varchar',
    length: 2048,
  })
  supportTelegramUrl: string;

  @Column({
    name: 'support_vk_url',
    type: 'varchar',
    length: 2048,
  })
  supportVkUrl: string;

  @Column({
    name: 'support_max_url',
    type: 'varchar',
    length: 2048,
  })
  supportMaxUrl: string;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
