import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

import { QUEUE_NAMES, JOB_NAMES } from '../../jobs/queues/queue.constants';
import { GenerateClassroomForPathJobData } from '../../jobs/queues/job-data.types';

export interface BuildCompletedEvent {
  buildJobId: string;
  pathId: string;
  pathName: string;
}

@Injectable()
export class BuildCompletedListener {
  private readonly logger = new Logger(BuildCompletedListener.name);

  constructor(
    @InjectQueue(QUEUE_NAMES.CLASSROOM_GENERATION)
    private readonly classroomQueue: Queue<GenerateClassroomForPathJobData>,
  ) {}

  @OnEvent('build.completed')
  async handleBuildCompleted(event: BuildCompletedEvent): Promise<void> {
    this.logger.log(
      `[BuildCompleted] Received build completion for path: ${event.pathName} (${event.pathId})`,
    );

    try {
      // Queue classroom content generation for the completed learning path
      const job = await this.classroomQueue.add(
        JOB_NAMES.GENERATE_CLASSROOM_FOR_PATH,
        {
          learningPathId: event.pathId,
          learningPathName: event.pathName,
        },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 10000, // Start with 10s delay for classroom generation
          },
          delay: 5000, // Give a 5s delay before starting classroom generation
        },
      );

      this.logger.log(
        `[BuildCompleted] Queued classroom generation job: ${job.id} for path: ${event.pathName}`,
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `[BuildCompleted] Failed to queue classroom generation for path ${event.pathId}: ${errorMessage}`,
      );
    }
  }
}
