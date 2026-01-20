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

import { Concept } from '../../concepts/entities/concept.entity';
import { Project } from './project.entity';

export interface RubricCriterionData {
  name: string;
  description: string;
  maxPoints: number;
}

@Entity('project_concepts')
@Unique(['projectId', 'conceptId'])
export class ProjectConcept {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  projectId: string;

  @ManyToOne(() => Project, (project) => project.projectConcepts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column()
  conceptId: string;

  @ManyToOne(() => Concept, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conceptId' })
  concept: Concept;

  @Column({ type: 'integer', default: 0 })
  weight: number; // % of total grade (0-100)

  @Column('simple-json', { default: '[]' })
  rubricCriteria: RubricCriterionData[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
