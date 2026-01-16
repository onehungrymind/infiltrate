import { Column, CreateDateColumn, Entity, Index,ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { KnowledgeUnit } from '../../knowledge-units/entities/knowledge-unit.entity';

@Entity('user_progress')
@Index(['userId', 'unitId'], { unique: true })
export class UserProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  unitId: string;

  @ManyToOne(() => KnowledgeUnit, unit => unit.userProgress)
  knowledgeUnit: KnowledgeUnit;

  @Column({ default: 'learning' })
  masteryLevel: string; // 'learning' | 'reviewing' | 'mastered'

  @Column({ default: 0 })
  confidence: number; // 0-100

  @Column('decimal', { precision: 3, scale: 2, default: 2.5 })
  easinessFactor: number; // 1.3-2.5

  @Column({ default: 1 })
  interval: number; // Days

  @Column({ default: 0 })
  repetitions: number;

  @Column()
  nextReviewDate: Date;

  @Column({ default: 0 })
  attempts: number;

  @Column({ nullable: true })
  lastAttemptAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
