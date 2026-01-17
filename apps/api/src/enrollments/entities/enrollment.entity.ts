import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { LearningPath } from '../../learning-paths/entities/learning-path.entity';
import { User } from '../../users/entities/user.entity';

export type EnrollmentStatus = 'active' | 'completed' | 'dropped';

@Entity('enrollments')
@Unique(['userId', 'pathId'])
export class Enrollment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  pathId: string;

  @Column({ nullable: true })
  mentorId: string;

  @Column({ default: 'active' })
  status: EnrollmentStatus;

  @Column({ type: 'datetime', nullable: true })
  enrolledAt: Date;

  @Column({ type: 'datetime', nullable: true })
  completedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'mentorId' })
  mentor: User;

  @ManyToOne(() => LearningPath, (path) => path.enrollments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pathId' })
  learningPath: LearningPath;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
