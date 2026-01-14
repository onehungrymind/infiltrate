import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { LearningPath } from '../../learning-paths/entities/learning-path.entity';
import { Principle } from '../../principles/entities/principle.entity';
import { UserProgress } from '../../user-progress/entities/user-progress.entity';

@Entity('knowledge_units')
export class KnowledgeUnit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  pathId: string;

  @ManyToOne(() => LearningPath, path => path.knowledgeUnits)
  learningPath: LearningPath;

  @Column({ nullable: true })
  principleId: string;

  @ManyToOne(() => Principle, principle => principle.knowledgeUnits, { nullable: true, onDelete: 'SET NULL' })
  principle: Principle;

  @Column()
  concept: string;

  @Column('text')
  question: string;

  @Column('text')
  answer: string;

  @Column('text', { nullable: true })
  elaboration: string;

  @Column('simple-array')
  examples: string[];

  @Column('simple-array')
  analogies: string[];

  @Column('simple-array')
  commonMistakes: string[];

  @Column()
  difficulty: string; // 'beginner' | 'intermediate' | 'advanced' | 'expert'

  @Column()
  cognitiveLevel: string; // 'remember' | 'understand' | 'apply' | etc.

  @Column({ default: 120 })
  estimatedTimeSeconds: number;

  @Column('simple-array')
  tags: string[];

  @Column('simple-array')
  sourceIds: string[];

  @Column({ default: 'pending' })
  status: string; // 'pending' | 'approved' | 'rejected'

  @OneToMany(() => UserProgress, progress => progress.knowledgeUnit)
  userProgress: UserProgress[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
