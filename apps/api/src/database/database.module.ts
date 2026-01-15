import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { SeedController } from './seed.controller';
import { LearningPath } from '../learning-paths/entities/learning-path.entity';
import { KnowledgeUnit } from '../knowledge-units/entities/knowledge-unit.entity';
import { Principle } from '../principles/entities/principle.entity';
import { RawContent } from '../raw-content/entities/raw-content.entity';
import { Source } from '../source-configs/entities/source.entity';
import { SourcePathLink } from '../source-configs/entities/source-path-link.entity';
import { UserProgress } from '../user-progress/entities/user-progress.entity';
import { User } from '../users/entities/user.entity';
import { DataSource } from '../data-sources/entities/data-source.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LearningPath, KnowledgeUnit, Principle, RawContent, Source, SourcePathLink, UserProgress, User, DataSource])],
  controllers: [SeedController],
  providers: [SeederService],
  exports: [SeederService],
})
export class DatabaseModule {}
