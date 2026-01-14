import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { KnowledgeUnit } from '../../knowledge-units/entities/knowledge-unit.entity';
import { Principle } from '../../principles/entities/principle.entity';
import { SourceConfig } from '../../source-configs/entities/source-config.entity';
import { RawContent } from '../../raw-content/entities/raw-content.entity';

@Entity('learning_paths')
export class LearningPath {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  name: string;

  @Column()
  domain: string;

  @Column()
  targetSkill: string;

  @Column({ default: 'not-started' })
  status: string;

  @OneToMany(() => KnowledgeUnit, unit => unit.learningPath)
  knowledgeUnits: KnowledgeUnit[];

  @OneToMany(() => Principle, principle => principle.learningPath)
  principles: Principle[];

  @OneToMany(() => SourceConfig, source => source.learningPath)
  sources: SourceConfig[];

  @OneToMany(() => RawContent, content => content.learningPath)
  rawContent: RawContent[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
