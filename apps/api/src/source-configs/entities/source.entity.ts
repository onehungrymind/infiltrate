import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { SourcePathLink } from './source-path-link.entity';

@Entity('sources')
@Unique(['url'])
export class Source {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  url: string;

  @Column()
  type: string; // 'rss' | 'article' | 'pdf'

  @Column()
  name: string;

  @OneToMany(() => SourcePathLink, (link) => link.source)
  pathLinks: SourcePathLink[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
