import { Column, CreateDateColumn, Entity, ManyToOne,PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { LearningPath } from '../../learning-paths/entities/learning-path.entity';

@Entity('raw_content')
export class RawContent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  pathId: string;

  @ManyToOne(() => LearningPath, path => path.rawContent)
  learningPath: LearningPath;

  @Column()
  sourceType: string;

  @Column()
  sourceUrl: string;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column({ nullable: true })
  author: string;

  @Column({ nullable: true })
  publishedDate: Date;

  @Column('simple-json')
  metadata: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
