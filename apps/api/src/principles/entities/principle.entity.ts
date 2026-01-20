import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany,PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { KnowledgeUnit } from '../../knowledge-units/entities/knowledge-unit.entity';
import { LearningPath } from '../../learning-paths/entities/learning-path.entity';
import { SubConcept } from '../../sub-concepts/entities/sub-concept.entity';

@Entity('principles')
export class Principle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  pathId: string;

  @ManyToOne(() => LearningPath, path => path.principles)
  learningPath: LearningPath;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column({ type: 'float', default: 1 })
  estimatedHours: number;

  @Column({ default: 'foundational' })
  difficulty: string; // 'foundational' | 'intermediate' | 'advanced'

  @Column('simple-array')
  prerequisites: string[];

  @Column({ default: 0 })
  order: number;

  @Column({ default: 'pending' })
  status: string; // 'pending' | 'in_progress' | 'mastered'

  @OneToMany(() => SubConcept, subConcept => subConcept.principle)
  subConcepts: SubConcept[];

  @OneToMany(() => KnowledgeUnit, unit => unit.principle)
  knowledgeUnits: KnowledgeUnit[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
