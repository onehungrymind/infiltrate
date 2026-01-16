import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('notebook_progress')
@Index(['userId', 'notebookId'], { unique: true })
export class NotebookProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  notebookId: string; // e.g., 'pandas_exercises'

  @Column('simple-array', { nullable: true })
  completedExercises: number[]; // Array of exercise numbers [1, 2, 3, ...]

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  completionRate: number; // 0.00 to 1.00

  @Column('text', { nullable: true })
  notebookCode: string; // Saved notebook code

  @Column('text', { nullable: true })
  validationResults: string; // JSON string of validation results

  @Column({ nullable: true })
  lastSubmittedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
