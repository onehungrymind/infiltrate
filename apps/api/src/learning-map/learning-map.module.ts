import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LearningMapController } from './learning-map.controller';
import { LearningMapService } from './learning-map.service';
import { LearningPath } from '../learning-paths/entities/learning-path.entity';
import { NotebookProgress } from '../notebooks/entities/notebook-progress.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LearningPath, NotebookProgress])],
  controllers: [LearningMapController],
  providers: [LearningMapService],
  exports: [LearningMapService],
})
export class LearningMapModule {}
