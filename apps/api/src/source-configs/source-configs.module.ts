import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Source } from './entities/source.entity';
import { SourcePathLink } from './entities/source-path-link.entity';
import { SourcesService } from './sources.service';
import { SourcesController } from './sources.controller';
import { LearningPath } from '../learning-paths/entities/learning-path.entity';

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
