import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { LearningPath } from '../../learning-paths/entities/learning-path.entity';

@Entity('source_configs')
export class SourceConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  pathId: string;

  @ManyToOne(() => LearningPath, path => path.sources)
  learningPath: LearningPath;

  @Column()
  url: string;

  @Column()
  type: string; // 'rss' | 'article' | 'pdf'

  @Column()
  name: string;

  @Column({ default: true })
  enabled: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
