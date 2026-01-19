import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('gymnasium_templates')
export class SessionTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  // === Template Content ===

  @Column('text')
  htmlTemplate: string;

  @Column('text')
  cssStyles: string;

  // === Configuration ===

  @Column({ default: true })
  supportsPrint: boolean;

  @Column({ default: true })
  supportsDarkMode: boolean;

  // === Ownership ===

  @Column({ nullable: true })
  creatorId: string;

  @Column({ default: false })
  isSystem: boolean;

  // === Timestamps ===

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
