import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { QUEUE_NAMES } from '../jobs/queues/queue.constants';
import { KnowledgeUnit } from '../knowledge-units/entities/knowledge-unit.entity';
import { SubConcept } from '../sub-concepts/entities/sub-concept.entity';
import { Concept } from '../concepts/entities/concept.entity';
import { LearningPath } from '../learning-paths/entities/learning-path.entity';

import { ClassroomContent } from './entities/classroom-content.entity';
import { ReadingProgress } from './entities/reading-progress.entity';
import { ReadingPreferences } from './entities/reading-preferences.entity';
import { MicroQuiz } from './entities/micro-quiz.entity';
import { MicroQuizAttempt } from './entities/micro-quiz-attempt.entity';

import { ClassroomController } from './classroom.controller';
import { ClassroomAdminController } from './classroom-admin.controller';
import { ClassroomService } from './classroom.service';
import { ClassroomGeneratorService } from './generation/classroom-generator.service';
import { ClassroomGenerationWorker } from './workers/classroom-generation.worker';
import { BuildCompletedListener } from './listeners/build-completed.listener';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ClassroomContent,
      ReadingProgress,
      ReadingPreferences,
      MicroQuiz,
      MicroQuizAttempt,
      KnowledgeUnit,
      SubConcept,
      Concept,
      LearningPath,
    ]),
    BullModule.registerQueue({ name: QUEUE_NAMES.CLASSROOM_GENERATION }),
  ],
  controllers: [ClassroomController, ClassroomAdminController],
  providers: [
    ClassroomService,
    ClassroomGeneratorService,
    ClassroomGenerationWorker,
    BuildCompletedListener,
  ],
  exports: [ClassroomService, ClassroomGeneratorService],
})
export class ClassroomModule {}
