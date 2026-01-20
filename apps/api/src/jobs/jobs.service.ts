import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';

import { LearningPath } from '../learning-paths/entities/learning-path.entity';
import { CreateBuildJobDto } from './dto/create-build-job.dto';
import { BuildJob, BuildJobStatus } from './entities/build-job.entity';
import { JobStep, JobStepStatus, JobStepType } from './entities/job-step.entity';
import { QUEUE_NAMES, JOB_NAMES } from './queues/queue.constants';
import { BuildPathJobData, JobProgressEvent } from './queues/job-data.types';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    @InjectRepository(BuildJob)
    private buildJobRepository: Repository<BuildJob>,
    @InjectRepository(JobStep)
    private jobStepRepository: Repository<JobStep>,
    @InjectRepository(LearningPath)
    private learningPathRepository: Repository<LearningPath>,
    @InjectQueue(QUEUE_NAMES.BUILD_PATH)
    private buildPathQueue: Queue<BuildPathJobData>,
    private eventEmitter: EventEmitter2,
  ) {}

  async createBuildJob(dto: CreateBuildJobDto): Promise<BuildJob> {
    const learningPath = await this.learningPathRepository.findOne({
      where: { id: dto.pathId },
    });

    if (!learningPath) {
      throw new NotFoundException(`Learning path ${dto.pathId} not found`);
    }

    // Check if there's already a running job for this path
    const existingJob = await this.buildJobRepository.findOne({
      where: {
        pathId: dto.pathId,
        status: 'running' as BuildJobStatus,
      },
    });

    if (existingJob) {
      this.logger.warn(`Build job already running for path ${dto.pathId}`);
      return existingJob;
    }

    // Create the build job record
    const buildJob = this.buildJobRepository.create({
      pathId: dto.pathId,
      status: 'pending',
      metadata: { pathName: learningPath.name },
    });

    await this.buildJobRepository.save(buildJob);

    // Add to BullMQ queue
    const job = await this.buildPathQueue.add(
      JOB_NAMES.BUILD_LEARNING_PATH,
      {
        buildJobId: buildJob.id,
        pathId: dto.pathId,
        pathName: learningPath.name,
      },
      {
        jobId: buildJob.id,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      },
    );

    // Update with BullMQ job ID
    buildJob.bullJobId = job.id;
    await this.buildJobRepository.save(buildJob);

    this.logger.log(`Created build job ${buildJob.id} for path ${learningPath.name}`);

    return buildJob;
  }

  async findAll(): Promise<BuildJob[]> {
    return this.buildJobRepository.find({
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async findOne(id: string): Promise<BuildJob> {
    const job = await this.buildJobRepository.findOne({
      where: { id },
      relations: ['steps'],
    });

    if (!job) {
      throw new NotFoundException(`Build job ${id} not found`);
    }

    return job;
  }

  async findByPath(pathId: string): Promise<BuildJob[]> {
    return this.buildJobRepository.find({
      where: { pathId },
      order: { createdAt: 'DESC' },
      take: 10,
    });
  }

  async getActiveJob(pathId: string): Promise<BuildJob | null> {
    return this.buildJobRepository.findOne({
      where: [
        { pathId, status: 'pending' as BuildJobStatus },
        { pathId, status: 'running' as BuildJobStatus },
      ],
      relations: ['steps'],
    });
  }

  async cancelJob(id: string): Promise<BuildJob> {
    const job = await this.findOne(id);

    if (job.status !== 'pending' && job.status !== 'running') {
      throw new Error(`Cannot cancel job in ${job.status} status`);
    }

    job.status = 'cancelled';
    job.completedAt = new Date();
    await this.buildJobRepository.save(job);

    // Remove from queue if still pending
    if (job.bullJobId) {
      const bullJob = await this.buildPathQueue.getJob(job.bullJobId);
      if (bullJob) {
        await bullJob.remove();
      }
    }

    this.emitProgress({
      buildJobId: job.id,
      type: 'job-failed',
      message: 'Job cancelled by user',
      timestamp: new Date(),
    });

    return job;
  }

  // =====================
  // Job State Management (called by workers)
  // =====================

  async updateJobStatus(
    jobId: string,
    status: BuildJobStatus,
    updates?: Partial<BuildJob>,
  ): Promise<BuildJob> {
    const job = await this.findOne(jobId);
    job.status = status;

    if (status === 'running' && !job.startedAt) {
      job.startedAt = new Date();
    }

    if (status === 'completed' || status === 'failed' || status === 'cancelled') {
      job.completedAt = new Date();
    }

    if (updates) {
      Object.assign(job, updates);
    }

    return this.buildJobRepository.save(job);
  }

  async createJobStep(
    buildJobId: string,
    type: JobStepType,
    entityId: string,
    entityName: string,
    order: number,
  ): Promise<JobStep> {
    const step = this.jobStepRepository.create({
      buildJobId,
      type,
      entityId,
      entityName,
      order,
      status: 'pending',
    });

    await this.jobStepRepository.save(step);

    // Update total steps count
    await this.buildJobRepository.increment({ id: buildJobId }, 'totalSteps', 1);

    return step;
  }

  async updateStepStatus(
    stepId: string,
    status: JobStepStatus,
    updates?: Partial<JobStep>,
  ): Promise<JobStep> {
    const step = await this.jobStepRepository.findOne({ where: { id: stepId } });

    if (!step) {
      throw new NotFoundException(`Job step ${stepId} not found`);
    }

    step.status = status;

    if (status === 'running' && !step.startedAt) {
      step.startedAt = new Date();
    }

    if (status === 'completed' || status === 'failed' || status === 'skipped') {
      step.completedAt = new Date();
    }

    if (updates) {
      Object.assign(step, updates);
    }

    await this.jobStepRepository.save(step);

    // Update build job counters
    if (status === 'completed') {
      await this.buildJobRepository.increment({ id: step.buildJobId }, 'completedSteps', 1);
    } else if (status === 'failed') {
      await this.buildJobRepository.increment({ id: step.buildJobId }, 'failedSteps', 1);
    }

    return step;
  }

  async incrementStepRetry(stepId: string): Promise<JobStep> {
    const step = await this.jobStepRepository.findOne({ where: { id: stepId } });

    if (!step) {
      throw new NotFoundException(`Job step ${stepId} not found`);
    }

    step.retryCount += 1;
    return this.jobStepRepository.save(step);
  }

  // =====================
  // Progress Events (SSE)
  // =====================

  emitProgress(event: JobProgressEvent): void {
    this.logger.log(`Emitting job.progress event: ${event.type} - ${event.message} (jobId: ${event.buildJobId})`);
    this.eventEmitter.emit('job.progress', event);
  }

  async getJobProgress(jobId: string): Promise<{
    job: BuildJob;
    steps: JobStep[];
    percentage: number;
  }> {
    const job = await this.findOne(jobId);
    const steps = await this.jobStepRepository.find({
      where: { buildJobId: jobId },
      order: { order: 'ASC' },
    });

    const percentage = job.totalSteps > 0
      ? Math.round((job.completedSteps / job.totalSteps) * 100)
      : 0;

    return { job, steps, percentage };
  }
}
