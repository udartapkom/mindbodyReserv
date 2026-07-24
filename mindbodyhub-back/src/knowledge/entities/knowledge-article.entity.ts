import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { KnowledgeBlock, KnowledgeStatus } from '../knowledge.types';

@Entity('knowledge_articles')
export class KnowledgeArticle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ unique: true, length: 255 })
  slug: string;

  @Column({ type: 'enum', enum: KnowledgeStatus, default: KnowledgeStatus.DRAFT })
  status: KnowledgeStatus;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  blocks: KnowledgeBlock[];

  @Column({ name: 'cover_url', type: 'varchar', length: 2048, nullable: true })
  coverUrl: string | null;

  @Column({ type: 'text', nullable: true })
  summary: string | null;

  /** Show eyebrow + summary on the public article page */
  @Column({ name: 'show_metadata', type: 'boolean', default: true })
  showMetadata: boolean;

  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
