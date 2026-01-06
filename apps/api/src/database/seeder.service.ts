import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LearningPath } from '../learning-paths/entities/learning-path.entity';
import { KnowledgeUnit } from '../knowledge-units/entities/knowledge-unit.entity';
import { RawContent } from '../raw-content/entities/raw-content.entity';
import { SourceConfig } from '../source-configs/entities/source-config.entity';
import { UserProgress } from '../user-progress/entities/user-progress.entity';
import { seedPayload } from './seed-payload';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectRepository(LearningPath)
    private learningPathsRepository: Repository<LearningPath>,
    @InjectRepository(KnowledgeUnit)
    private knowledgeUnitsRepository: Repository<KnowledgeUnit>,
    @InjectRepository(RawContent)
    private rawContentRepository: Repository<RawContent>,
    @InjectRepository(SourceConfig)
    private sourceConfigsRepository: Repository<SourceConfig>,
    @InjectRepository(UserProgress)
    private userProgressRepository: Repository<UserProgress>,
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
   * Seeds the database with learning paths, knowledge units, source configs, raw content, and user progress
   */
  private async seedData(): Promise<void> {
    // 1) Seed Learning Paths first
    const learningPaths = await this.seedLearningPaths();
    this.logger.log(`📚 Seeded ${learningPaths.length} learning paths`);

    // 2) Seed Source Configs (linked to learning paths)
    await this.seedSourceConfigs(learningPaths);
    this.logger.log('📡 Seeded source configurations');

    // 3) Seed Raw Content (linked to learning paths)
    await this.seedRawContent(learningPaths);
    this.logger.log('📄 Seeded raw content');

    // 4) Seed Knowledge Units (linked to learning paths)
    const knowledgeUnits = await this.seedKnowledgeUnits(learningPaths);
    this.logger.log(`💡 Seeded ${knowledgeUnits.length} knowledge units`);

    // 5) Seed User Progress (linked to knowledge units)
    await this.seedUserProgress(knowledgeUnits);
    this.logger.log('📊 Seeded user progress');
  }

  private async seedLearningPaths(): Promise<LearningPath[]> {
    const learningPaths = await this.learningPathsRepository.save(
      seedPayload.learningPaths.map(path => ({
        ...path,
        status: path.status || 'not-started',
      })),
    );

    return learningPaths;
  }

  private async seedSourceConfigs(learningPaths: LearningPath[]): Promise<void> {
    const sourceConfigsToSave = seedPayload.sourceConfigs.map(config => {
      // Find the learning path by matching the index or by name
      const pathId = learningPaths.find(
        (_, index) => `path-${index + 1}` === config.pathId,
      )?.id || learningPaths[0]?.id;

      return {
        ...config,
        pathId: pathId || learningPaths[0]?.id,
        enabled: config.enabled !== undefined ? config.enabled : true,
      };
    });

    await this.sourceConfigsRepository.save(sourceConfigsToSave);
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

  private async seedKnowledgeUnits(learningPaths: LearningPath[]): Promise<KnowledgeUnit[]> {
    const knowledgeUnitsToSave = seedPayload.knowledgeUnits.map(unit => {
      const pathId = learningPaths.find(
        (_, index) => `path-${index + 1}` === unit.pathId,
      )?.id || learningPaths[0]?.id;

      return {
        ...unit,
        pathId: pathId || learningPaths[0]?.id,
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

  private async seedUserProgress(knowledgeUnits: KnowledgeUnit[]): Promise<void> {
    const progressToSave = seedPayload.userProgress.map(progress => {
      // Find knowledge unit (using first one for demo, or match by index)
      const unitId = knowledgeUnits[0]?.id;

      return {
        ...progress,
        unitId: unitId || knowledgeUnits[0]?.id,
        nextReviewDate: progress.nextReviewDate || new Date(Date.now() + 24 * 60 * 60 * 1000),
        lastAttemptAt: progress.lastAttemptAt || new Date(),
      };
    });

    await this.userProgressRepository.save(progressToSave);
  }

  async clearDatabase(): Promise<void> {
    await this.userProgressRepository.clear();
    await this.knowledgeUnitsRepository.clear();
    await this.rawContentRepository.clear();
    await this.sourceConfigsRepository.clear();
    await this.learningPathsRepository.clear();
    this.logger.log('🧹 Cleared existing data');
  }
}
