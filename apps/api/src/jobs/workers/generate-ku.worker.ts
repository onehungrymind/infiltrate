import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { LearningMapService } from '../../learning-map/learning-map.service';
import { JobsService } from '../jobs.service';
import { QUEUE_NAMES } from '../queues/queue.constants';
import { GenerateKUJobData } from '../queues/job-data.types';

@Processor(QUEUE_NAMES.GENERATE_KU)
export class GenerateKUWorker extends WorkerHost {
  private readonly logger = new Logger(GenerateKUWorker.name);

  constructor(
    private readonly jobsService: JobsService,
    private readonly learningMapService: LearningMapService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super();
  }

  async process(job: Job<GenerateKUJobData>): Promise<void> {
    const { buildJobId, stepId, subConceptId, subConceptName, conceptId } = job.data;

    this.logger.log(`[GenerateKU] Generating KUs for: ${subConceptName} (${subConceptId})`);

    try {
      // Update step status to running
      await this.jobsService.updateStepStatus(stepId, 'running');

      this.jobsService.emitProgress({
        buildJobId,
        type: 'step-started',
        stepId,
        stepType: 'generate-ku',
        message: `Generating knowledge units for "${subConceptName}"...`,
        timestamp: new Date(),
      });

      // Generate structured knowledge units
      const result = await this.learningMapService.generateStructuredKU(subConceptId);
      const knowledgeUnits = result.knowledgeUnits;

      this.logger.log(`[GenerateKU] Generated ${knowledgeUnits.length} KUs for ${subConceptName}`);

      // Update step as completed
      await this.jobsService.updateStepStatus(stepId, 'completed', {
        result: { kuCount: knowledgeUnits.length },
      });

      this.jobsService.emitProgress({
        buildJobId,
        type: 'step-completed',
        stepId,
        stepType: 'generate-ku',
        message: `Generated ${knowledgeUnits.length} KUs for "${subConceptName}"`,
        timestamp: new Date(),
        entities: {
          knowledgeUnits,
          selectedConceptId: conceptId,
          selectedSubConceptId: subConceptId,
        },
      });

      // Check if the entire build job is complete
      await this.checkAndFinalizeBuildJob(buildJobId);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`[GenerateKU] Failed for ${subConceptName}: ${errorMessage}`);

      // Update step as failed
      await this.jobsService.updateStepStatus(stepId, 'failed', {
        errorMessage,
      });

      this.jobsService.emitProgress({
        buildJobId,
        type: 'step-failed',
        stepId,
        stepType: 'generate-ku',
        message: `Failed to generate KUs for "${subConceptName}"`,
        error: errorMessage,
        timestamp: new Date(),
      });

      // Increment retry count
      await this.jobsService.incrementStepRetry(stepId);

      throw error;
    }
  }

  private async checkAndFinalizeBuildJob(buildJobId: string): Promise<void> {
    const { job, steps, percentage } = await this.jobsService.getJobProgress(buildJobId);

    // Count pending and running steps
    const pendingSteps = steps.filter(s => s.status === 'pending' || s.status === 'running');

    this.logger.log(`[GenerateKU] Build job progress: ${percentage}% (${pendingSteps.length} steps remaining)`);

    // Update progress
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

    // If all steps are done (no pending/running), mark job as completed
    if (pendingSteps.length === 0) {
      const hasFailures = job.failedSteps > 0;

      if (hasFailures) {
        await this.jobsService.updateJobStatus(buildJobId, 'completed', {
          currentOperation: null,
          errorMessage: `Completed with ${job.failedSteps} failed steps`,
        });

        this.jobsService.emitProgress({
          buildJobId,
          type: 'job-completed',
          message: `Build completed with ${job.failedSteps} failures`,
          progress: {
            completed: job.completedSteps,
            total: job.totalSteps,
            percentage: 100,
          },
          timestamp: new Date(),
        });
      } else {
        await this.jobsService.updateJobStatus(buildJobId, 'completed', {
          currentOperation: null,
        });

        this.jobsService.emitProgress({
          buildJobId,
          type: 'job-completed',
          message: 'Build completed successfully!',
          progress: {
            completed: job.completedSteps,
            total: job.totalSteps,
            percentage: 100,
          },
          timestamp: new Date(),
        });

        this.logger.log(`[GenerateKU] Build job ${buildJobId} completed successfully!`);

        // Emit event for classroom generation to pick up
        this.eventEmitter.emit('build.completed', {
          buildJobId,
          pathId: job.pathId,
          pathName: job.metadata?.pathName || 'Unknown Path',
        });
      }
    }
  }
}
