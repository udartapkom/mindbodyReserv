import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { InsightBlock, InsightStatus } from '../insight.types';

@Entity('insights')
export class Insight {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ unique: true, length: 255 })
  slug: string;

  @Column({ type: 'enum', enum: InsightStatus, default: InsightStatus.DRAFT })
  status: InsightStatus;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  blocks: InsightBlock[];

  /**
   * Calendar day the insight is meant for (also used for delayed visibility).
   * Cabinet feed only shows status=published AND publishedAt <= end of today (Moscow).
   */
  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
