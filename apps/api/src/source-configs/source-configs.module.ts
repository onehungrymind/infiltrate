import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LearningPath } from '../learning-paths/entities/learning-path.entity';
import { Source } from './entities/source.entity';
import { SourcePathLink } from './entities/source-path-link.entity';
import { SourcesController } from './sources.controller';
import { SourcesService } from './sources.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Source,
      SourcePathLink,
      LearningPath,
    ]),
  ],
  controllers: [SourcesController],
  providers: [SourcesService],
  exports: [SourcesService],
})
export class SourceConfigsModule {}
