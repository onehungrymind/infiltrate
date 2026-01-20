import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { BuildJob } from './build-job.entity';

export type JobStepType = 'generate-concepts' | 'decompose-concept' | 'generate-ku';
export type JobStepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

@Entity('job_steps')
export class JobStep {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  buildJobId: string;

  @ManyToOne(() => BuildJob, job => job.steps, { onDelete: 'CASCADE' })
  buildJob: BuildJob;

  @Column()
  type: JobStepType;

  @Column({ default: 'pending' })
  status: JobStepStatus;

  @Column({ nullable: true })
  bullJobId: string;

  @Column({ nullable: true })
  entityId: string; // conceptId or subConceptId being processed

  @Column({ nullable: true })
  entityName: string; // For display purposes

  @Column({ default: 0 })
  order: number;

  @Column({ default: 0 })
  retryCount: number;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'simple-json', nullable: true })
  result: Record<string, unknown>;

  @Column({ type: 'datetime', nullable: true })
  startedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  completedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
