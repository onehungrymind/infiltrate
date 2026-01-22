import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { ClassroomContent } from './classroom-content.entity';
import { SubConcept } from '../../sub-concepts/entities/sub-concept.entity';
import { Concept } from '../../concepts/entities/concept.entity';
import { LearningPath } from '../../learning-paths/entities/learning-path.entity';

export type ReadingStatus = 'not_started' | 'in_progress' | 'completed';

@Entity('reading_progress')
@Unique(['userId', 'classroomContentId'])
export class ReadingProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // User relationship
  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  // Content relationship
  @Column()
  classroomContentId: string;

  @ManyToOne(() => ClassroomContent, { onDelete: 'CASCADE' })
  classroomContent: ClassroomContent;

  // Denormalized for easier queries
  @Column()
  subConceptId: string;

  @ManyToOne(() => SubConcept, { onDelete: 'CASCADE' })
  subConcept: SubConcept;

  @Column()
  conceptId: string;

  @ManyToOne(() => Concept, { onDelete: 'CASCADE' })
  concept: Concept;

  @Column()
  learningPathId: string;

  @ManyToOne(() => LearningPath, { onDelete: 'CASCADE' })
  learningPath: LearningPath;

  // Progress tracking (Kindle-style)
  @Column({ default: 'not_started' })
  status: ReadingStatus;

  @Column({ type: 'float', default: 0 })
  scrollPosition: number; // Percentage 0-100

  @Column({ type: 'datetime', nullable: true })
  lastReadAt: Date | null;

  @Column({ type: 'datetime', nullable: true })
  completedAt: Date | null;

  // Time tracking
  @Column({ default: 0 })
  totalReadTime: number; // Seconds

  @Column({ default: 0 })
  sessionCount: number; // How many reading sessions

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
