import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { KnowledgeUnit } from '../../knowledge-units/entities/knowledge-unit.entity';
import { Principle } from '../../principles/entities/principle.entity';
import { SubConceptDecoration } from './sub-concept-decoration.entity';

@Entity('sub_concepts')
export class SubConcept {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  principleId: string;

  @ManyToOne(() => Principle, principle => principle.subConcepts, { onDelete: 'CASCADE' })
  principle: Principle;

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
