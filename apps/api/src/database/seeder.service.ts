import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { Challenge } from '../challenges/entities/challenge.entity';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { KnowledgeUnit } from '../knowledge-units/entities/knowledge-unit.entity';
import { LearningPath } from '../learning-paths/entities/learning-path.entity';
import { Principle } from '../principles/entities/principle.entity';
import { Project } from '../projects/entities/project.entity';
import { RawContent } from '../raw-content/entities/raw-content.entity';
import { Source } from '../source-configs/entities/source.entity';
import { SourcePathLink } from '../source-configs/entities/source-path-link.entity';
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
    @InjectRepository(Principle)
    private principlesRepository: Repository<Principle>,
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

    // Seed all data
    await this.seedData();

    this.logger.log('✅ Database seeding completed!');
  }

  /**
   * Seeds the database with users, learning paths, knowledge units, source configs, raw content, and user progress
   */
  private async seedData(): Promise<void> {
    // 0) Seed Users first (includes regular users and mentors)
    const users = await this.seedUsers();
    this.logger.log(`👤 Seeded ${users.length} users`);

    // 1) Seed Learning Paths (linked to users and mentors)
    const learningPaths = await this.seedLearningPaths(users);
    this.logger.log(`📚 Seeded ${learningPaths.length} learning paths`);

    // 1.5) Seed Enrollments (linking users to paths)
    const enrollments = await this.seedEnrollments(users, learningPaths);
    this.logger.log(`📋 Seeded ${enrollments.length} enrollments`);

    // 2) Seed Principles (linked to learning paths)
    const principles = await this.seedPrinciples(learningPaths);
    this.logger.log(`🎯 Seeded ${principles.length} principles`);

    // 3) Seed Source Configs (linked to learning paths)
    await this.seedSourceConfigs(learningPaths);
    this.logger.log('📡 Seeded source configurations');

    // 4) Seed Raw Content (linked to learning paths)
    await this.seedRawContent(learningPaths);
    this.logger.log('📄 Seeded raw content');

    // 5) Seed Knowledge Units (linked to learning paths and principles)
    const knowledgeUnits = await this.seedKnowledgeUnits(learningPaths, principles);
    this.logger.log(`💡 Seeded ${knowledgeUnits.length} knowledge units`);

    // 6) Seed Challenges (linked to knowledge units)
    const challenges = await this.seedChallenges(knowledgeUnits);
    this.logger.log(`🏆 Seeded ${challenges.length} challenges`);

    // 7) Seed Projects (linked to learning paths)
    const projects = await this.seedProjects(learningPaths);
    this.logger.log(`📁 Seeded ${projects.length} projects`);

    // 8) Seed User Progress (linked to knowledge units and users)
    await this.seedUserProgress(knowledgeUnits, users);
    this.logger.log('📊 Seeded user progress');

    // 9) Seed Submissions (linked to users, challenges, projects, paths)
    const submissions = await this.seedSubmissions(users, challenges, projects, learningPaths);
    this.logger.log(`📝 Seeded ${submissions.length} submissions`);

    // 10) Seed Feedback (linked to submissions and mentors)
    const feedback = await this.seedFeedback(submissions, users);
    this.logger.log(`💬 Seeded ${feedback.length} feedback entries`);
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

  private async seedPrinciples(learningPaths: LearningPath[]): Promise<Principle[]> {
    const principlesToSave = seedPayload.principles.map(principle => {
      const pathId = learningPaths.find(
        (_, index) => `path-${index + 1}` === principle.pathId,
      )?.id || learningPaths[0]?.id;

      return {
        ...principle,
        pathId: pathId || learningPaths[0]?.id,
        prerequisites: principle.prerequisites || [],
        estimatedHours: principle.estimatedHours || 1,
        order: principle.order || 0,
        status: principle.status || 'pending',
      };
    });

    const savedPrinciples = await this.principlesRepository.save(principlesToSave);
    return savedPrinciples;
  }

  private async seedSourceConfigs(learningPaths: LearningPath[]): Promise<void> {
    // Group source configs by URL to avoid duplicates
    const urlToSourceMap = new Map<string, { source: any; pathIds: { pathId: string; enabled: boolean }[] }>();

    for (const config of seedPayload.sourceConfigs) {
      const pathId = learningPaths.find(
        (_, index) => `path-${index + 1}` === config.pathId,
      )?.id || learningPaths[0]?.id;

      if (!urlToSourceMap.has(config.url)) {
        urlToSourceMap.set(config.url, {
          source: { url: config.url, type: config.type, name: config.name },
          pathIds: [],
        });
      }
      urlToSourceMap.get(config.url)!.pathIds.push({
        pathId: pathId!,
        enabled: config.enabled !== undefined ? config.enabled : true,
      });
    }

    // Create sources and links
    for (const { source, pathIds } of urlToSourceMap.values()) {
      const savedSource = await this.sourcesRepository.save(source);
      for (const { pathId, enabled } of pathIds) {
        await this.sourcePathLinksRepository.save({
          sourceId: savedSource.id,
          pathId,
          enabled,
        });
      }
    }
  }

  private async seedRawContent(learningPaths: LearningPath[]): Promise<void> {
    const rawContentToSave = seedPayload.rawContent.map(content => {
      const pathId = learningPaths.find(
        (_, index) => `path-${index + 1}` === content.pathId,
      )?.id || learningPaths[0]?.id;

      return {
        ...content,
        pathId: pathId || learningPaths[0]?.id,
        publishedDate: content.publishedDate || new Date(),
        metadata: content.metadata || {},
      };
    });

    await this.rawContentRepository.save(rawContentToSave);
  }

  private async seedKnowledgeUnits(learningPaths: LearningPath[], principles: Principle[]): Promise<KnowledgeUnit[]> {
    const knowledgeUnitsToSave = seedPayload.knowledgeUnits.map((unit, index) => {
      const pathId = learningPaths.find(
        (_, idx) => `path-${idx + 1}` === unit.pathId,
      )?.id || learningPaths[0]?.id;

      // Find a principle for this path to link (optional)
      const matchingPrinciples = principles.filter(p => p.pathId === pathId);
      const principleId = matchingPrinciples.length > 0
        ? matchingPrinciples[index % matchingPrinciples.length]?.id
        : undefined;

      return {
        ...unit,
        pathId: pathId || learningPaths[0]?.id,
        principleId: principleId,
        examples: unit.examples || [],
        analogies: unit.analogies || [],
        commonMistakes: unit.commonMistakes || [],
        tags: unit.tags || [],
        sourceIds: unit.sourceIds || [],
        estimatedTimeSeconds: unit.estimatedTimeSeconds || 300,
        status: unit.status || 'pending',
      };
    });

    const savedUnits = await this.knowledgeUnitsRepository.save(knowledgeUnitsToSave);
    return savedUnits;
  }

  private async seedUserProgress(knowledgeUnits: KnowledgeUnit[], users: User[]): Promise<void> {
    const testUserId = users[0]?.id || 'demo-user-1';

    const progressToSave = seedPayload.userProgress.map(progress => {
      // Find knowledge unit (using first one for demo, or match by index)
      const unitId = knowledgeUnits[0]?.id;

      return {
        ...progress,
        userId: testUserId, // Use the seeded test user ID
        unitId: unitId || knowledgeUnits[0]?.id,
        nextReviewDate: progress.nextReviewDate || new Date(Date.now() + 24 * 60 * 60 * 1000),
        lastAttemptAt: progress.lastAttemptAt || new Date(),
      };
    });

    await this.userProgressRepository.save(progressToSave);
  }

  private async seedChallenges(knowledgeUnits: KnowledgeUnit[]): Promise<Challenge[]> {
    if (!seedPayload.challenges || seedPayload.challenges.length === 0) {
      return [];
    }

    const challengesToSave = seedPayload.challenges.map((challenge, index) => {
      // Map unit-1, unit-2, etc. to actual unit IDs
      const unitIndex = parseInt(challenge.unitId.replace('unit-', '')) - 1;
      const unitId = knowledgeUnits[unitIndex]?.id || knowledgeUnits[0]?.id;

      return {
        ...challenge,
        unitId: unitId,
      };
    });

    const savedChallenges = await this.challengesRepository.save(challengesToSave);
    return savedChallenges;
  }

  private async seedProjects(learningPaths: LearningPath[]): Promise<Project[]> {
    if (!seedPayload.projects || seedPayload.projects.length === 0) {
      return [];
    }

    const projectsToSave = seedPayload.projects.map((project) => {
      // Map path-1, path-2, etc. to actual path IDs
      const pathIndex = parseInt(project.pathId.replace('path-', '')) - 1;
      const pathId = learningPaths[pathIndex]?.id || learningPaths[0]?.id;

      return {
        ...project,
        pathId: pathId,
      };
    });

    const savedProjects = await this.projectsRepository.save(projectsToSave);
    return savedProjects;
  }

  private async seedSubmissions(
    users: User[],
    challenges: Challenge[],
    projects: Project[],
    learningPaths: LearningPath[],
  ): Promise<Submission[]> {
    if (!seedPayload.submissions || seedPayload.submissions.length === 0) {
      return [];
    }

    const regularUser = users.find(u => u.role === 'user') || users[0];

    const submissionsToSave = seedPayload.submissions.map((submission) => {
      // Map challenge-1, challenge-2, etc. to actual challenge IDs
      let challengeId: string | undefined;
      if (submission.challengeId) {
        const challengeIndex = parseInt(submission.challengeId.replace('challenge-', '')) - 1;
        challengeId = challenges[challengeIndex]?.id;
      }

      // Map project-1, project-2, etc. to actual project IDs
      let projectId: string | undefined;
      if (submission.projectId) {
        const projectIndex = parseInt(submission.projectId.replace('project-', '')) - 1;
        projectId = projects[projectIndex]?.id;
      }

      // Map path-1, path-2, etc. to actual path IDs
      let pathId: string | undefined;
      if (submission.pathId) {
        const pathIndex = parseInt(submission.pathId.replace('path-', '')) - 1;
        pathId = learningPaths[pathIndex]?.id;
      }

      return {
        ...submission,
        userId: regularUser?.id || 'demo-user-1',
        challengeId,
        projectId,
        pathId,
      };
    });

    const savedSubmissions = await this.submissionsRepository.save(submissionsToSave);
    return savedSubmissions;
  }

  private async seedFeedback(submissions: Submission[], users: User[]): Promise<Feedback[]> {
    if (!seedPayload.feedback || seedPayload.feedback.length === 0) {
      return [];
    }

    const mentorUser = users.find(u => u.role === 'mentor');

    const feedbackToSave = seedPayload.feedback.map((fb) => {
      // Map submission-1, submission-2, etc. to actual submission IDs
      const submissionIndex = parseInt(fb.submissionId.replace('submission-', '')) - 1;
      const submissionId = submissions[submissionIndex]?.id;

      // Set reviewerId for mentor feedback
      const reviewerId = fb.source === 'mentor' ? mentorUser?.id : undefined;

      return {
        ...fb,
        submissionId,
        reviewerId,
      };
    });

    // Filter out feedback for submissions that don't exist
    const validFeedback = feedbackToSave.filter(fb => fb.submissionId);

    const savedFeedback = await this.feedbackRepository.save(validFeedback);
    return savedFeedback;
  }

  async clearDatabase(): Promise<void> {
    // Clear in order respecting foreign key constraints
    await this.feedbackRepository.clear();
    await this.submissionsRepository.clear();
    await this.userProgressRepository.clear();
    await this.challengesRepository.clear();
    await this.projectsRepository.clear();
    await this.knowledgeUnitsRepository.clear();
    await this.principlesRepository.clear();
    await this.rawContentRepository.clear();
    await this.sourcePathLinksRepository.clear();
    await this.sourcesRepository.clear();
    await this.enrollmentsRepository.clear();
    await this.learningPathsRepository.clear();
    await this.usersRepository.clear();
    this.logger.log('🧹 Cleared existing data');
  }
}
