import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('data_sources')
export class DataSource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column()
  url: string;

  @Column({ nullable: true })
  archiveUrl?: string;

  @Column()
  type: string; // 'rss' | 'article' | 'pdf'

  @Column('simple-array', { default: '' })
  tags: string[];

  @Column({ default: true })
  enabled: boolean;

  @Column({ default: 'current' })
  parsingMode: string; // 'current' | 'archive' | 'both'

  @Column({ nullable: true })
  scheduleFrequency?: string; // 'daily' | 'weekly' | 'monthly' | 'manual'

  @Column({ type: 'datetime', nullable: true })
  lastIngestedAt?: Date;

  @Column('simple-json', { nullable: true })
  parsingInstructions?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

