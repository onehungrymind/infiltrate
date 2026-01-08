import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('graph_searches')
export class GraphSearch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string; // For now, can be 'anonymous'

  @Column()
  topic: string;

  @Column('simple-json')
  graphData: any; // The generated graph

  @CreateDateColumn()
  createdAt: Date;
}
