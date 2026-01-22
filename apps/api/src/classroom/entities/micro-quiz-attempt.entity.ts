import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { MicroQuiz } from './micro-quiz.entity';

export interface QuizAnswer {
  questionId: string;
  answer: string | number;
}

export interface QuizResult {
  questionId: string;
  correct: boolean;
  userAnswer: string | number;
  correctAnswer: string | number;
}

@Entity('micro_quiz_attempts')
export class MicroQuizAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  microQuizId: string;

  @ManyToOne(() => MicroQuiz, { onDelete: 'CASCADE' })
  microQuiz: MicroQuiz;

  @Column('simple-json')
  answers: QuizAnswer[];

  @Column('simple-json')
  results: QuizResult[];

  @Column({ type: 'float' })
  score: number; // Percentage 0-100

  @Column()
  passed: boolean;

  @Column({ type: 'datetime' })
  startedAt: Date;

  @CreateDateColumn()
  completedAt: Date;
}
