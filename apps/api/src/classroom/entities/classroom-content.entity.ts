import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { SubConcept } from '../../sub-concepts/entities/sub-concept.entity';
import { Concept } from '../../concepts/entities/concept.entity';
import { LearningPath } from '../../learning-paths/entities/learning-path.entity';

/**
 * Section types for classroom content
 */
export interface CodeBlock {
  language: string;
  code: string;
  filename?: string;
  highlightLines?: number[];
  caption?: string;
}

export interface DiagramBlock {
  type: 'mermaid' | 'ascii';
  source: string;
  caption?: string;
}

export interface CalloutBlock {
  type: 'tip' | 'warning' | 'info' | 'example' | 'analogy';
  title?: string;
  content: string;
}

export interface ClassroomSection {
  id: string;
  order: number;
  type: 'prose' | 'code' | 'diagram' | 'callout';
  content?: string; // Markdown for prose
  code?: CodeBlock;
  diagram?: DiagramBlock;
  callout?: CalloutBlock;
}

export type ClassroomContentStatus = 'pending' | 'generating' | 'ready' | 'error';

@Entity('classroom_contents')
export class ClassroomContent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Relationships
  @Column()
  subConceptId: string;

  @ManyToOne(() => SubConcept, { onDelete: 'CASCADE' })
  subConcept: SubConcept;

  @Column()
  conceptId: string;

  @ManyToOne(() => Concept, { onDelete: 'CASCADE' })
  concept: Concept;

  @Column()
  learningPathId: string;

  @ManyToOne(() => LearningPath, { onDelete: 'CASCADE' })
  learningPath: LearningPath;

  // Content
  @Column()
  title: string;

  @Column('text')
  summary: string;

  @Column('simple-json')
  sections: ClassroomSection[];

  // Metadata
  @Column({ default: 0 })
  estimatedReadTime: number; // Minutes

  @Column({ default: 0 })
  wordCount: number;

  @Column({ default: 1 })
  version: number;

  // Generation tracking
  @Column({ default: 'pending' })
  status: ClassroomContentStatus;

  @Column({ type: 'datetime', nullable: true })
  generatedAt: Date | null;

  @Column({ type: 'datetime', nullable: true })
  regeneratedAt: Date | null;

  @Column('simple-json', { default: '[]' })
  sourceKuIds: string[]; // KUs used to generate this content

  @Column('text', { nullable: true })
  errorMessage: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
