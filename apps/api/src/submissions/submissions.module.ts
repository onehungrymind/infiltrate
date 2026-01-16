import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { SubmissionsService } from './submissions.service';
import { SubmissionsController } from './submissions.controller';
import { Submission } from './entities/submission.entity';
import { Feedback } from './entities/feedback.entity';
import { KnowledgeUnit } from '../knowledge-units/entities/knowledge-unit.entity';
import { LearningPath } from '../learning-paths/entities/learning-path.entity';
import { multerConfig } from './utils/file-upload';

@Module({
  imports: [
    TypeOrmModule.forFeature([Submission, Feedback, KnowledgeUnit, LearningPath]),
    MulterModule.register(multerConfig),
  ],
  controllers: [SubmissionsController],
  providers: [SubmissionsService],
  exports: [SubmissionsService],
})
export class SubmissionsModule {}
