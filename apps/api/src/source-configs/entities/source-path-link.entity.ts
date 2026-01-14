import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Source } from './source.entity';
import { LearningPath } from '../../learning-paths/entities/learning-path.entity';

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
