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
import { KnowledgeUnit } from '../../knowledge-units/entities/knowledge-unit.entity';

export interface RubricCriterionData {
  name: string;
  description: string;
  maxPoints: number;
}

@Entity('challenges')
export class Challenge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  unitId: string;

  @ManyToOne(() => KnowledgeUnit, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'unitId' })
  knowledgeUnit: KnowledgeUnit;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ default: 'beginner' })
  difficulty: string; // 'beginner' | 'intermediate' | 'advanced' | 'expert'

  @Column({ default: 30 })
  estimatedMinutes: number;

  @Column('simple-json', { default: '[]' })
  rubricCriteria: RubricCriterionData[];

  @Column('simple-array', { default: '' })
  successCriteria: string[];

  @Column('simple-array', { default: 'code' })
  contentTypes: string[]; // 'code' | 'written' | 'project'

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
