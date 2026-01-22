import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';

export type ReadingTheme = 'light' | 'dark' | 'sepia';
export type FontSize = 'small' | 'medium' | 'large';
export type LineSpacing = 'compact' | 'normal' | 'relaxed';
export type FontFamily = 'sans' | 'serif' | 'mono';

@Entity('reading_preferences')
@Unique(['userId'])
export class ReadingPreferences {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  // Display preferences
  @Column({ default: 'light' })
  theme: ReadingTheme;

  @Column({ default: 'medium' })
  fontSize: FontSize;

  @Column({ default: 'normal' })
  lineSpacing: LineSpacing;

  @Column({ default: 'sans' })
  fontFamily: FontFamily;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
