import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

import { SubConcept } from '../../sub-concepts/entities/sub-concept.entity';
import { ClassroomContent } from './classroom-content.entity';

export type QuestionType = 'multiple_choice' | 'true_false' | 'fill_blank';
export type MicroQuizStatus = 'pending' | 'generating' | 'ready' | 'error';

export interface MicroQuizQuestion {
  id: string;
  order: number;
  type: QuestionType;
  question: string;
  options?: string[]; // For multiple choice
  correctAnswer: string | number;
  explanation: string; // Shown after answering
  sourceKuId?: string; // Which KU this tests
}

@Entity('micro_quizzes')
@Unique(['subConceptId'])
export class MicroQuiz {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  subConceptId: string;

  @ManyToOne(() => SubConcept, { onDelete: 'CASCADE' })
  subConcept: SubConcept;

  @Column({ nullable: true })
  classroomContentId: string;

  @ManyToOne(() => ClassroomContent, { onDelete: 'CASCADE', nullable: true })
  classroomContent: ClassroomContent;

  @Column('simple-json')
  questions: MicroQuizQuestion[];

  @Column({ default: 70 })
  passingScore: number; // Percentage required to pass

  @Column({ default: 'pending' })
  status: MicroQuizStatus;

  @Column({ type: 'datetime', nullable: true })
  generatedAt: Date | null;

  @Column('text', { nullable: true })
  errorMessage: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
