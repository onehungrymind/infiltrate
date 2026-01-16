import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LearningPath } from './entities/learning-path.entity';
import { LearningPathsController } from './learning-paths.controller';
import { LearningPathsService } from './learning-paths.service';

@Module({
  imports: [TypeOrmModule.forFeature([LearningPath])],
  controllers: [LearningPathsController],
  providers: [LearningPathsService],
})
export class LearningPathsModule {}
