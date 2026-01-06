import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { SeedController } from './seed.controller';
import { LearningPath } from '../learning-paths/entities/learning-path.entity';
import { KnowledgeUnit } from '../knowledge-units/entities/knowledge-unit.entity';
import { RawContent } from '../raw-content/entities/raw-content.entity';
import { SourceConfig } from '../source-configs/entities/source-config.entity';
import { UserProgress } from '../user-progress/entities/user-progress.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LearningPath, KnowledgeUnit, RawContent, SourceConfig, UserProgress, User])],
  controllers: [SeedController],
  providers: [SeederService],
  exports: [SeederService],
})
export class DatabaseModule {}
