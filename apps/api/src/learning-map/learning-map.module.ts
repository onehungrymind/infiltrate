import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { LearningMapController } from './learning-map.controller';
import { LearningMapService } from './learning-map.service';
import { LearningPath } from '../learning-paths/entities/learning-path.entity';
import { NotebookProgress } from '../notebooks/entities/notebook-progress.entity';
import { Principle } from '../principles/entities/principle.entity';
import { KnowledgeUnit } from '../knowledge-units/entities/knowledge-unit.entity';
import { Source } from '../source-configs/entities/source.entity';
import { SourcePathLink } from '../source-configs/entities/source-path-link.entity';
import { RawContent } from '../raw-content/entities/raw-content.entity';
import { SourceConfigsModule } from '../source-configs/source-configs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LearningPath,
      NotebookProgress,
      Principle,
      KnowledgeUnit,
      Source,
      SourcePathLink,
      RawContent,
    ]),
    ConfigModule,
    SourceConfigsModule,
  ],
  controllers: [LearningMapController],
  providers: [LearningMapService],
  exports: [LearningMapService],
})
export class LearningMapModule {}
