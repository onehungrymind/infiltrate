import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SourceConfigsService } from './source-configs.service';
import { SourceConfigsController } from './source-configs.controller';
import { SourceConfig } from './entities/source-config.entity';
import { Source } from './entities/source.entity';
import { SourcePathLink } from './entities/source-path-link.entity';
import { SourcesService } from './sources.service';
import { SourcesController } from './sources.controller';
import { LearningPath } from '../learning-paths/entities/learning-path.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SourceConfig,
      Source,
      SourcePathLink,
      LearningPath,
    ]),
  ],
  controllers: [SourceConfigsController, SourcesController],
  providers: [SourceConfigsService, SourcesService],
  exports: [SourcesService],
})
export class SourceConfigsModule {}
