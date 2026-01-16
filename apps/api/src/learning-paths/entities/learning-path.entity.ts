import { Column, CreateDateColumn, Entity, JoinColumn,ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { KnowledgeUnit } from '../../knowledge-units/entities/knowledge-unit.entity';
import { Principle } from '../../principles/entities/principle.entity';
import { RawContent } from '../../raw-content/entities/raw-content.entity';
import { SourcePathLink } from '../../source-configs/entities/source-path-link.entity';
import { User } from '../../users/entities/user.entity';

@Entity('learning_paths')
export class LearningPath {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ nullable: true })
  mentorId: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'mentorId' })
  mentor: User;

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

  @OneToMany(() => SourcePathLink, link => link.learningPath)
  sourceLinks: SourcePathLink[];

  @OneToMany(() => RawContent, content => content.learningPath)
  rawContent: RawContent[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
