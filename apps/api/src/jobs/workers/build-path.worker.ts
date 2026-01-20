import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

import { LearningMapService } from '../../learning-map/learning-map.service';
import { JobsService } from '../jobs.service';
import { QUEUE_NAMES, JOB_NAMES } from '../queues/queue.constants';
import {
  BuildPathJobData,
  DecomposeConceptJobData,
} from '../queues/job-data.types';

@Processor(QUEUE_NAMES.BUILD_PATH)
export class BuildPathWorker extends WorkerHost {
  private readonly logger = new Logger(BuildPathWorker.name);

  constructor(
    private readonly jobsService: JobsService,
    private readonly learningMapService: LearningMapService,
    @InjectQueue(QUEUE_NAMES.DECOMPOSE_CONCEPT)
    private readonly decomposeQueue: Queue<DecomposeConceptJobData>,
  ) {
    super();
  }

  async process(job: Job<BuildPathJobData>): Promise<void> {
    const { buildJobId, pathId, pathName } = job.data;

    this.logger.log(`[BuildPath] Starting build for path: ${pathName} (${pathId})`);

    try {
      // Update job status to running
      await this.jobsService.updateJobStatus(buildJobId, 'running', {
        currentOperation: 'Generating concepts...',
      });

      this.jobsService.emitProgress({
        buildJobId,
        type: 'step-started',
        stepType: 'generate-concepts',
        message: `Generating concepts for "${pathName}"...`,
        timestamp: new Date(),
      });

      // Step 1: Generate concepts
      const conceptResult = await this.learningMapService.generateConceptsWithAI(pathId, true);
      const concepts = conceptResult.concepts;

      this.logger.log(`[BuildPath] Generated ${concepts.length} concepts`);

      this.jobsService.emitProgress({
        buildJobId,
        type: 'step-completed',
        stepType: 'generate-concepts',
        message: `Generated ${concepts.length} concepts`,
        timestamp: new Date(),
        entities: {
          concepts,
        },
      });

      // Create job steps for each concept decomposition
      for (let i = 0; i < concepts.length; i++) {
        const concept = concepts[i];
        const step = await this.jobsService.createJobStep(
          buildJobId,
          'decompose-concept',
          concept.id,
          concept.name,
          i,
        );

        // Queue the decompose job
        await this.decomposeQueue.add(
          JOB_NAMES.DECOMPOSE_SINGLE_CONCEPT,
          {
            buildJobId,
            stepId: step.id,
            conceptId: concept.id,
            conceptName: concept.name,
          },
          {
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 5000,
            },
          },
        );
      }

      // Update job status
      await this.jobsService.updateJobStatus(buildJobId, 'running', {
        currentOperation: `Decomposing ${concepts.length} concepts...`,
        totalSteps: concepts.length,
      });

      this.logger.log(`[BuildPath] Queued ${concepts.length} decompose jobs`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`[BuildPath] Failed: ${errorMessage}`);

      await this.jobsService.updateJobStatus(buildJobId, 'failed', {
        errorMessage,
        currentOperation: null,
      });

      this.jobsService.emitProgress({
        buildJobId,
        type: 'job-failed',
        message: `Build failed: ${errorMessage}`,
        error: errorMessage,
        timestamp: new Date(),
      });

      throw error;
    }
  }
}
