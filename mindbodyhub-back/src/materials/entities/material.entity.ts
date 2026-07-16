import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MaterialBlock, MaterialStatus } from '../material.types';

@Entity('materials')
export class Material {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ unique: true, length: 255 })
  slug: string;

  @Column({ type: 'enum', enum: MaterialStatus, default: MaterialStatus.DRAFT })
  status: MaterialStatus;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  blocks: MaterialBlock[];

  /**
   * Tariff access: `free` = public, otherwise matches tariffs.type (trial/popular/vip…)
   */
  @Column({ name: 'tariff_type', length: 50, default: 'free' })
  tariffType: string;

  @Column({ name: 'cover_url', type: 'varchar', length: 2048, nullable: true })
  coverUrl: string | null;

  @Column({ type: 'text', nullable: true })
  summary: string | null;

  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
