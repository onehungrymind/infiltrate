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

import { Principle } from '../../principles/entities/principle.entity';
import { Project } from './project.entity';

export interface RubricCriterionData {
  name: string;
  description: string;
  maxPoints: number;
}

@Entity('project_principles')
@Unique(['projectId', 'principleId'])
export class ProjectPrinciple {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  projectId: string;

  @ManyToOne(() => Project, (project) => project.projectPrinciples, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column()
  principleId: string;

  @ManyToOne(() => Principle, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'principleId' })
  principle: Principle;

  @Column({ type: 'integer', default: 0 })
  weight: number; // % of total grade (0-100)

  @Column('simple-json', { default: '[]' })
  rubricCriteria: RubricCriterionData[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
