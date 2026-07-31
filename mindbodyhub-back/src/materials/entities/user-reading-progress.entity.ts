import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Material } from './material.entity';

@Entity('user_reading_progress')
@Unique('uq_user_reading_progress_user_material', ['userId', 'materialId'])
@Index('idx_user_reading_progress_user_updated', ['userId', 'updatedAt'])
export class UserReadingProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'material_id', type: 'uuid' })
  materialId: string;

  @ManyToOne(() => Material, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'material_id' })
  material: Material;

  /** Document scroll progress from 0 to 1. */
  @Column({
    name: 'scroll_ratio',
    type: 'double precision',
    default: 0,
  })
  scrollRatio: number;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
