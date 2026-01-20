import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { Challenge } from '../challenges/entities/challenge.entity';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { KnowledgeUnit } from '../knowledge-units/entities/knowledge-unit.entity';
import { LearningPath } from '../learning-paths/entities/learning-path.entity';
import { Concept } from '../concepts/entities/concept.entity';
import { Project } from '../projects/entities/project.entity';
import { RawContent } from '../raw-content/entities/raw-content.entity';
import { Source } from '../source-configs/entities/source.entity';
import { SourcePathLink } from '../source-configs/entities/source-path-link.entity';
import { SubConcept } from '../sub-concepts/entities/sub-concept.entity';
import { Feedback } from '../submissions/entities/feedback.entity';
import { Submission } from '../submissions/entities/submission.entity';
import { UserProgress } from '../user-progress/entities/user-progress.entity';
import { User } from '../users/entities/user.entity';
import { seedPayload } from './seed-payload';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectRepository(LearningPath)
    private learningPathsRepository: Repository<LearningPath>,
    @InjectRepository(KnowledgeUnit)
    private knowledgeUnitsRepository: Repository<KnowledgeUnit>,
    @InjectRepository(Concept)
    private conceptsRepository: Repository<Concept>,
    @InjectRepository(SubConcept)
    private subConceptsRepository: Repository<SubConcept>,
    @InjectRepository(RawContent)
    private rawContentRepository: Repository<RawContent>,
    @InjectRepository(Source)
    private sourcesRepository: Repository<Source>,
    @InjectRepository(SourcePathLink)
    private sourcePathLinksRepository: Repository<SourcePathLink>,
    @InjectRepository(UserProgress)
    private userProgressRepository: Repository<UserProgress>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Challenge)
    private challengesRepository: Repository<Challenge>,
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(Submission)
    private submissionsRepository: Repository<Submission>,
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
    @InjectRepository(Enrollment)
    private enrollmentsRepository: Repository<Enrollment>,
  ) {}

  async seed(): Promise<void> {
    this.logger.log('🌱 Starting database seeding for Kasita...');

    // Reset the entire database first
    await this.clearDatabase();

    // Seed base data only (users, learning paths, enrollments)
    await this.seedData();

    this.logger.log('✅ Database seeding completed!');
  }

  /**
   * Seeds the database with users and learning paths only.
   * Downstream entities (concepts, sub-concepts, KUs, etc.) are added via AI generation.
   */
  private async seedData(): Promise<void> {
    // 1) Seed Users first (includes regular users and mentors)
    const users = await this.seedUsers();
    this.logger.log(`👤 Seeded ${users.length} users`);

    // 2) Seed Learning Paths (linked to users)
    const learningPaths = await this.seedLearningPaths(users);
    this.logger.log(`📚 Seeded ${learningPaths.length} learning paths`);

    // 3) Seed Enrollments (linking users to paths)
    const enrollments = await this.seedEnrollments(users, learningPaths);
    this.logger.log(`📋 Seeded ${enrollments.length} enrollments`);
  }

  private async seedUsers(): Promise<User[]> {
    const saltRounds = 12;
    const savedUsers: User[] = [];

    for (const userData of seedPayload.users) {
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
      const user = this.usersRepository.create({
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        isActive: true,
        role: userData.role,
      });
      const savedUser = await this.usersRepository.save(user);
      savedUsers.push(savedUser);
    }

    return savedUsers;
  }

  private async seedLearningPaths(users: User[]): Promise<LearningPath[]> {
    const mentorUser = users.find(u => u.role === 'mentor');

    const learningPaths = await this.learningPathsRepository.save(
      seedPayload.learningPaths.map(path => ({
        name: path.name,
        domain: path.domain,
        targetSkill: path.targetSkill,
        creatorId: mentorUser?.id || users[0]?.id || 'demo-user-1',
        visibility: path.visibility || 'private',
        status: path.status || 'not-started',
      })),
    );

    return learningPaths;
  }

  private async seedEnrollments(users: User[], learningPaths: LearningPath[]): Promise<Enrollment[]> {
    const regularUser = users.find(u => u.role === 'user') || users[0];
    const mentorUser = users.find(u => u.role === 'mentor');
    const enrollments: Enrollment[] = [];

    // Enroll the regular user in the first two learning paths
    for (let i = 0; i < Math.min(2, learningPaths.length); i++) {
      const enrollment = this.enrollmentsRepository.create({
        userId: regularUser?.id || 'demo-user-1',
        pathId: learningPaths[i].id,
        // Assign mentor to the first enrollment
        mentorId: i === 0 && mentorUser ? mentorUser.id : undefined,
        status: 'active',
        enrolledAt: new Date(),
      });
      const saved = await this.enrollmentsRepository.save(enrollment);
      enrollments.push(saved);
    }

    return enrollments;
  }

  async clearDatabase(): Promise<void> {
    // Clear in order respecting foreign key constraints
    await this.feedbackRepository.clear();
    await this.submissionsRepository.clear();
    await this.userProgressRepository.clear();
    await this.challengesRepository.clear();
    await this.projectsRepository.clear();
    await this.knowledgeUnitsRepository.clear();
    await this.subConceptsRepository.clear();
    await this.conceptsRepository.clear();
    await this.rawContentRepository.clear();
    await this.sourcePathLinksRepository.clear();
    await this.sourcesRepository.clear();
    await this.enrollmentsRepository.clear();
    await this.learningPathsRepository.clear();
    await this.usersRepository.clear();
    this.logger.log('🧹 Cleared existing data');
  }
}
