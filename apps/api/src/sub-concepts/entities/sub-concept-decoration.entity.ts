import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Column } from 'typeorm';

import { KnowledgeUnit } from '../../knowledge-units/entities/knowledge-unit.entity';
import { SubConcept } from './sub-concept.entity';

@Entity('sub_concept_decorations')
export class SubConceptDecoration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  subConceptId: string;

  @ManyToOne(() => SubConcept, subConcept => subConcept.decorations, { onDelete: 'CASCADE' })
  subConcept: SubConcept;

  @Column()
  knowledgeUnitId: string;

  @ManyToOne(() => KnowledgeUnit, { onDelete: 'CASCADE' })
  knowledgeUnit: KnowledgeUnit;

  @CreateDateColumn()
  createdAt: Date;
}
