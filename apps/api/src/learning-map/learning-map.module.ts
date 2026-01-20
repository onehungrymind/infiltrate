import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { KnowledgeUnit } from '../knowledge-units/entities/knowledge-unit.entity';
import { LearningPath } from '../learning-paths/entities/learning-path.entity';
import { NotebookProgress } from '../notebooks/entities/notebook-progress.entity';
import { Principle } from '../principles/entities/principle.entity';
import { RawContent } from '../raw-content/entities/raw-content.entity';
import { Source } from '../source-configs/entities/source.entity';
import { SourcePathLink } from '../source-configs/entities/source-path-link.entity';
import { SourceConfigsModule } from '../source-configs/source-configs.module';
import { SubConcept } from '../sub-concepts/entities/sub-concept.entity';
import { LearningMapController } from './learning-map.controller';
import { LearningMapService } from './learning-map.service';

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
      SubConcept,
    ]),
    ConfigModule,
    SourceConfigsModule,
  ],
  controllers: [LearningMapController],
  providers: [LearningMapService],
  exports: [LearningMapService],
})
export class LearningMapModule {}
