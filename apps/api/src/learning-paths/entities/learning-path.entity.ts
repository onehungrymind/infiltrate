import { Column, CreateDateColumn, Entity, JoinColumn,ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { Enrollment } from '../../enrollments/entities/enrollment.entity';
import { KnowledgeUnit } from '../../knowledge-units/entities/knowledge-unit.entity';
import { Principle } from '../../principles/entities/principle.entity';
import { RawContent } from '../../raw-content/entities/raw-content.entity';
import { SourcePathLink } from '../../source-configs/entities/source-path-link.entity';
import { User } from '../../users/entities/user.entity';

export type PathVisibility = 'private' | 'shared' | 'public';

@Entity('learning_paths')
export class LearningPath {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  creatorId: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @Column({ nullable: true })
  mentorId: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'mentorId' })
  mentor: User;

  @Column({ default: 'private' })
  visibility: PathVisibility;

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

  @OneToMany(() => Enrollment, enrollment => enrollment.learningPath)
  enrollments: Enrollment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
