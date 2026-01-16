import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Submission } from './submission.entity';

export interface RubricScore {
  criterion: string;
  achieved: number;
  maximum: number;
  feedback?: string;
}

@Entity('feedback')
export class Feedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  submissionId: string;

  @ManyToOne(() => Submission, (submission) => submission.feedback, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'submissionId' })
  submission: Submission;

  @Column()
  source: string; // 'ai' | 'mentor'

  @Column({ nullable: true })
  reviewerId: string; // For mentor feedback

  @Column({ type: 'integer' })
  overallScore: number; // 0-100

  @Column('simple-json')
  rubricBreakdown: RubricScore[];

  @Column('simple-json')
  suggestions: string[];

  @Column('text')
  content: string; // Detailed feedback

  @CreateDateColumn()
  createdAt: Date;
}
