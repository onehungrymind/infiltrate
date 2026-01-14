import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Unique,
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
