import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { QuoteStatus } from '../quote.types';

@Entity('quotes')
export class Quote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  author: string | null;

  @Column({ type: 'enum', enum: QuoteStatus, default: QuoteStatus.DRAFT })
  status: QuoteStatus;

  /** Calendar day the quote is meant for (also used for feed ordering). */
  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
