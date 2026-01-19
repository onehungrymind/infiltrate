import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import {
  SessionContent,
  SessionDifficulty,
  SessionVisibility,
} from '@kasita/common-models';

@Entity('gymnasium_sessions')
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  slug: string;

  // === Metadata ===

  @Column()
  title: string;

  @Column({ nullable: true })
  subtitle: string;

  @Column('text')
  description: string;

  @Column()
  domain: string;

  @Column('simple-array', { default: '' })
  tags: string[];

  @Column('varchar', { default: 'beginner' })
  difficulty: SessionDifficulty;

  @Column({ default: 60 })
  estimatedMinutes: number;

  // === Cover/Branding ===

  @Column({ nullable: true })
  badgeText: string;

  @Column('simple-json', { nullable: true })
  coverMeta: string[];

  // === Ownership ===

  @Column()
  creatorId: string;

  @Column('varchar', { default: 'private' })
  visibility: SessionVisibility;

  // === Content (denormalized JSON) ===

  @Column('simple-json')
  content: SessionContent;

  // === Timestamps ===

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  publishedAt: Date;
}
