import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { LearningPath } from '../../learning-paths/entities/learning-path.entity';
import { JobStep } from './job-step.entity';

export type BuildJobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

@Entity('build_jobs')
export class BuildJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  pathId: string;

  @ManyToOne(() => LearningPath, { onDelete: 'CASCADE' })
  learningPath: LearningPath;

  @Column({ default: 'pending' })
  status: BuildJobStatus;

  @Column({ nullable: true })
  bullJobId: string;

  @Column({ default: 0 })
  totalSteps: number;

  @Column({ default: 0 })
  completedSteps: number;

  @Column({ default: 0 })
  failedSteps: number;

  @Column({ type: 'text', nullable: true })
  currentOperation: string;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'simple-json', nullable: true })
  metadata: Record<string, unknown>;

  @OneToMany(() => JobStep, step => step.buildJob)
  steps: JobStep[];

  @Column({ type: 'datetime', nullable: true })
  startedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  completedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
