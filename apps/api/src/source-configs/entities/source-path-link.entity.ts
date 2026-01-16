import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { LearningPath } from '../../learning-paths/entities/learning-path.entity';
import { Source } from './source.entity';

@Entity('source_path_links')
@Unique(['sourceId', 'pathId'])
export class SourcePathLink {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sourceId: string;

  @Column()
  pathId: string;

  @Column({ default: true })
  enabled: boolean;

  @ManyToOne(() => Source, (source) => source.pathLinks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sourceId' })
  source: Source;

  @ManyToOne(() => LearningPath, (path) => path.sourceLinks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pathId' })
  learningPath: LearningPath;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
