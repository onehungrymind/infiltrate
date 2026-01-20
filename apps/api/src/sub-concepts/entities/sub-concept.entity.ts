import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { KnowledgeUnit } from '../../knowledge-units/entities/knowledge-unit.entity';
import { Concept } from '../../concepts/entities/concept.entity';
import { SubConceptDecoration } from './sub-concept-decoration.entity';

@Entity('sub_concepts')
export class SubConcept {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  conceptId: string;

  @ManyToOne(() => Concept, concept => concept.subConcepts, { onDelete: 'CASCADE' })
  concept: Concept;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column({ default: 0 })
  order: number;

  @OneToMany(() => KnowledgeUnit, unit => unit.subConcept)
  knowledgeUnits: KnowledgeUnit[];

  @OneToMany(() => SubConceptDecoration, decoration => decoration.subConcept)
  decorations: SubConceptDecoration[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
