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
import { Challenge } from '../../challenges/entities/challenge.entity';
import { Project } from '../../projects/entities/project.entity';
import { Feedback } from './feedback.entity';

export interface UrlMetadataData {
  title?: string;
  description?: string;
  platform?: string;
  repoStats?: {
    stars?: number;
    language?: string;
    lastCommit?: Date;
  };
}

export interface FileMetadataData {
  originalName: string;
  mimeType: string;
  size: number;
  storagePath: string;
}

@Entity('submissions')
export class Submission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  // @deprecated - use challengeId instead
  @Column({ nullable: true })
  unitId: string;

  @ManyToOne(() => KnowledgeUnit, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'unitId' })
  knowledgeUnit: KnowledgeUnit;

  @Column({ nullable: true })
  challengeId: string;

  @ManyToOne(() => Challenge, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'challengeId' })
  challenge: Challenge;

  @Column({ nullable: true })
  projectId: string;

  @ManyToOne(() => Project, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column({ nullable: true })
  pathId: string;

  @Column()
  title: string;

  @Column({ default: 'text' })
  contentType: string; // 'text' | 'url' | 'file'

  @Column('text')
  content: string; // Text content OR URL OR file path

  @Column('simple-json', { nullable: true })
  urlMetadata: UrlMetadataData;

  @Column('simple-json', { nullable: true })
  fileMetadata: FileMetadataData;

  @Column({ default: 'draft' })
  status: string; // 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected'

  @Column({ nullable: true })
  grade: string; // 'accepted' | 'accepted_with_comments' | 'needs_work' (for project submissions)

  @Column({ type: 'integer', nullable: true })
  score: number; // 0-100

  @Column({ nullable: true })
  submittedAt: Date;

  @Column({ nullable: true })
  reviewedAt: Date;

  @Column('simple-json', { nullable: true })
  metadata: Record<string, any>;

  @OneToMany(() => Feedback, (feedback) => feedback.submission)
  feedback: Feedback[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
