import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LearningPath } from '../learning-paths/entities/learning-path.entity';
import { LearningMapModule } from '../learning-map/learning-map.module';
import { BuildJob } from './entities/build-job.entity';
import { JobStep } from './entities/job-step.entity';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { QUEUE_NAMES } from './queues/queue.constants';
import { BuildPathWorker } from './workers/build-path.worker';
import { DecomposeConceptWorker } from './workers/decompose-concept.worker';
import { GenerateKUWorker } from './workers/generate-ku.worker';

@Module({
  imports: [
    TypeOrmModule.forFeature([BuildJob, JobStep, LearningPath]),
    BullModule.registerQueue(
      { name: QUEUE_NAMES.BUILD_PATH },
      { name: QUEUE_NAMES.DECOMPOSE_CONCEPT },
      { name: QUEUE_NAMES.GENERATE_KU },
    ),
    LearningMapModule,
  ],
  controllers: [JobsController],
  providers: [
    JobsService,
    BuildPathWorker,
    DecomposeConceptWorker,
    GenerateKUWorker,
  ],
  exports: [JobsService],
})
export class JobsModule {}
