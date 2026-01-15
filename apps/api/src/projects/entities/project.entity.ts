import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { LearningPath } from '../../learning-paths/entities/learning-path.entity';
import { ProjectPrinciple } from './project-principle.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  pathId: string;

  @ManyToOne(() => LearningPath, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pathId' })
  learningPath: LearningPath;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column('simple-array', { default: '' })
  objectives: string[];

  @Column('simple-array', { default: '' })
  requirements: string[];

  @Column({ default: 10 })
  estimatedHours: number;

  @Column({ default: 'intermediate' })
  difficulty: string; // 'beginner' | 'intermediate' | 'advanced' | 'expert'

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => ProjectPrinciple, (pp) => pp.project)
  projectPrinciples: ProjectPrinciple[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
