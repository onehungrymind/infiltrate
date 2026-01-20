import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

import { LearningMapService } from '../../learning-map/learning-map.service';
import { JobsService } from '../jobs.service';
import { QUEUE_NAMES, JOB_NAMES } from '../queues/queue.constants';
import {
  DecomposeConceptJobData,
  GenerateKUJobData,
} from '../queues/job-data.types';

@Processor(QUEUE_NAMES.DECOMPOSE_CONCEPT)
export class DecomposeConceptWorker extends WorkerHost {
  private readonly logger = new Logger(DecomposeConceptWorker.name);

  constructor(
    private readonly jobsService: JobsService,
    private readonly learningMapService: LearningMapService,
    @InjectQueue(QUEUE_NAMES.GENERATE_KU)
    private readonly generateKUQueue: Queue<GenerateKUJobData>,
  ) {
    super();
  }

  async process(job: Job<DecomposeConceptJobData>): Promise<void> {
    const { buildJobId, stepId, conceptId, conceptName } = job.data;

    this.logger.log(`[DecomposeConcept] Decomposing: ${conceptName} (${conceptId})`);

    try {
      // Update step status to running
      await this.jobsService.updateStepStatus(stepId, 'running');

      this.jobsService.emitProgress({
        buildJobId,
        type: 'step-started',
        stepId,
        stepType: 'decompose-concept',
        message: `Decomposing "${conceptName}"...`,
        timestamp: new Date(),
      });

      // Decompose the concept into sub-concepts
      const result = await this.learningMapService.decomposeIntoSubConcepts(conceptId);
      const subConcepts = result.subConcepts;

      this.logger.log(`[DecomposeConcept] Generated ${subConcepts.length} sub-concepts for ${conceptName}`);

      // Update step as completed
      await this.jobsService.updateStepStatus(stepId, 'completed', {
        result: { subConceptCount: subConcepts.length },
      });

      this.jobsService.emitProgress({
        buildJobId,
        type: 'step-completed',
        stepId,
        stepType: 'decompose-concept',
        message: `Decomposed "${conceptName}" into ${subConcepts.length} sub-concepts`,
        timestamp: new Date(),
        entities: {
          subConcepts,
          selectedConceptId: conceptId,
        },
      });

      // Create job steps and queue generate-ku jobs for each sub-concept
      for (let i = 0; i < subConcepts.length; i++) {
        const subConcept = subConcepts[i];
        const kuStep = await this.jobsService.createJobStep(
          buildJobId,
          'generate-ku',
          subConcept.id,
          subConcept.name,
          1000 + i, // Higher order so they come after decompose steps
        );

        // Queue the generate-ku job
        await this.generateKUQueue.add(
          JOB_NAMES.GENERATE_SINGLE_KU,
          {
            buildJobId,
            stepId: kuStep.id,
            subConceptId: subConcept.id,
            subConceptName: subConcept.name,
            conceptId,  // Pass parent concept for UI selection
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

      this.logger.log(`[DecomposeConcept] Queued ${subConcepts.length} KU generation jobs`);

      // Check if this was the last decompose job and update build job accordingly
      await this.checkAndUpdateBuildJobProgress(buildJobId);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`[DecomposeConcept] Failed for ${conceptName}: ${errorMessage}`);

      // Update step as failed
      await this.jobsService.updateStepStatus(stepId, 'failed', {
        errorMessage,
      });

      this.jobsService.emitProgress({
        buildJobId,
        type: 'step-failed',
        stepId,
        stepType: 'decompose-concept',
        message: `Failed to decompose "${conceptName}"`,
        error: errorMessage,
        timestamp: new Date(),
      });

      // Increment retry count
      await this.jobsService.incrementStepRetry(stepId);

      throw error;
    }
  }

  private async checkAndUpdateBuildJobProgress(buildJobId: string): Promise<void> {
    const { job, percentage } = await this.jobsService.getJobProgress(buildJobId);

    await this.jobsService.updateJobStatus(buildJobId, 'running', {
      currentOperation: `Building learning path... ${percentage}% complete`,
    });

    this.jobsService.emitProgress({
      buildJobId,
      type: 'step-completed',
      message: `Progress: ${percentage}%`,
      progress: {
        completed: job.completedSteps,
        total: job.totalSteps,
        percentage,
      },
      timestamp: new Date(),
    });
  }
}
