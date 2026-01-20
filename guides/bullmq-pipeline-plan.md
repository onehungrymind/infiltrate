# BullMQ + Redis Pipeline Resiliency Plan

**Created**: January 19, 2026
**Status**: Planning
**Priority**: P1 - Core Experience

---

## Executive Summary

Implement a production-grade background job processing system using BullMQ and Redis to handle long-running pipeline operations. This system will provide:

- **Resilience**: Jobs survive browser refresh, server restart, and network issues
- **Parallelism**: Fan-out pattern for concurrent concept/sub-concept processing
- **Observability**: Real-time progress tracking, job history, and error visibility
- **Scalability**: Horizontal scaling via multiple workers
- **Reliability**: Automatic retries, dead letter queues, and graceful degradation

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (Angular)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │ Job Trigger UI  │  │ Progress Panel  │  │ Job History / Admin Panel   │  │
│  │ "Build Path"    │  │ Real-time SSE   │  │ Retry, Cancel, View Logs    │  │
│  └────────┬────────┘  └────────▲────────┘  └─────────────▲───────────────┘  │
│           │                    │                         │                   │
└───────────┼────────────────────┼─────────────────────────┼───────────────────┘
            │ POST /jobs         │ SSE /jobs/:id/stream    │ GET /jobs
            ▼                    │                         │
┌───────────────────────────────────────────────────────────────────────────────┐
│                              API LAYER (NestJS)                               │
├───────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐   │
│  │ JobsController  │  │ JobsService     │  │ SSE EventEmitter            │   │
│  │ REST endpoints  │  │ Queue producer  │  │ Real-time updates           │   │
│  └────────┬────────┘  └────────┬────────┘  └─────────────▲───────────────┘   │
│           │                    │                         │                    │
│           ▼                    ▼                         │                    │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                         BullMQ Queues                                    │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │ │
│  │  │ build-path   │  │ decompose    │  │ generate-ku  │  │ dead-letter  │ │ │
│  │  │ (orchestrator)│  │ (fan-out)    │  │ (fan-out)    │  │ (failures)   │ │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                    │                                          │
│                                    ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                         BullMQ Workers                                   │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │ │
│  │  │ BuildPath    │  │ Decompose    │  │ GenerateKU   │                   │ │
│  │  │ Worker       │  │ Worker (x3)  │  │ Worker (x5)  │                   │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘                   │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────────────┘
            │                                                      │
            ▼                                                      ▼
┌───────────────────────┐                            ┌───────────────────────┐
│        Redis          │                            │      PostgreSQL/      │
│  - Job queues         │                            │        SQLite         │
│  - Job state          │                            │  - BuildJob entity    │
│  - Progress data      │                            │  - JobStep entity     │
│  - Pub/Sub for SSE    │                            │  - Audit log          │
└───────────────────────┘                            └───────────────────────┘
```

---

## Phase 1: Infrastructure & Core Setup

### 1.1 Redis Setup

**Development (Local)**
```yaml
# docker-compose.yml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

volumes:
  redis_data:
```

**Production Options**
- AWS ElastiCache
- Redis Cloud
- Upstash (serverless Redis)
- Self-hosted with Redis Sentinel

**Configuration**
```typescript
// apps/api/src/config/redis.config.ts
export const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  // Connection pool for high concurrency
  family: 4,
  db: 0,
};
```

### 1.2 NestJS BullMQ Module Setup

**Dependencies**
```bash
npm install @nestjs/bullmq bullmq ioredis
```

**Module Registration**
```typescript
// apps/api/src/app/app.module.ts
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: {
          age: 24 * 3600, // Keep completed jobs for 24 hours
          count: 1000,    // Keep last 1000 completed jobs
        },
        removeOnFail: {
          age: 7 * 24 * 3600, // Keep failed jobs for 7 days
        },
      },
    }),
    // Queue registrations
    BullModule.registerQueue(
      { name: 'build-path' },
      { name: 'decompose-concept' },
      { name: 'generate-ku' },
    ),
    JobsModule,
  ],
})
export class AppModule {}
```

---

## Phase 2: Database Schema

### 2.1 BuildJob Entity

```typescript
// apps/api/src/jobs/entities/build-job.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { LearningPath } from '../../learning-paths/entities/learning-path.entity';

export type BuildJobStatus =
  | 'pending'      // Created, waiting to start
  | 'processing'   // Currently running
  | 'completed'    // Successfully finished
  | 'failed'       // Failed with error
  | 'cancelled'    // Manually cancelled
  | 'paused';      // Paused by user

export type BuildJobStage =
  | 'concepts'
  | 'sub-concepts'
  | 'knowledge-units';

@Entity('build_jobs')
export class BuildJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  pathId: string;

  @ManyToOne(() => LearningPath, { onDelete: 'CASCADE' })
  learningPath: LearningPath;

  @Column({ type: 'varchar', default: 'pending' })
  status: BuildJobStatus;

  @Column({ type: 'varchar', nullable: true })
  currentStage: BuildJobStage | null;

  // Progress tracking
  @Column({ type: 'int', default: 0 })
  totalConcepts: number;

  @Column({ type: 'int', default: 0 })
  completedConcepts: number;

  @Column({ type: 'int', default: 0 })
  totalSubConcepts: number;

  @Column({ type: 'int', default: 0 })
  completedSubConcepts: number;

  @Column({ type: 'int', default: 0 })
  totalKnowledgeUnits: number;

  @Column({ type: 'int', default: 0 })
  completedKnowledgeUnits: number;

  // Error tracking
  @Column({ type: 'text', nullable: true })
  error: string | null;

  @Column({ type: 'int', default: 0 })
  errorCount: number;

  // Timing
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date | null;

  // BullMQ reference
  @Column({ type: 'varchar', nullable: true })
  bullJobId: string | null;

  // User who triggered
  @Column({ nullable: true })
  triggeredBy: string;

  // Child steps
  @OneToMany(() => JobStep, step => step.buildJob)
  steps: JobStep[];

  // Computed progress percentage
  get progressPercent(): number {
    const conceptWeight = 0.2;
    const subConceptWeight = 0.3;
    const kuWeight = 0.5;

    const conceptProgress = this.totalConcepts > 0
      ? (this.completedConcepts / this.totalConcepts) * conceptWeight
      : 0;
    const subConceptProgress = this.totalSubConcepts > 0
      ? (this.completedSubConcepts / this.totalSubConcepts) * subConceptWeight
      : 0;
    const kuProgress = this.totalKnowledgeUnits > 0
      ? (this.completedKnowledgeUnits / this.totalKnowledgeUnits) * kuWeight
      : 0;

    return Math.round((conceptProgress + subConceptProgress + kuProgress) * 100);
  }
}
```

### 2.2 JobStep Entity (Granular Tracking)

```typescript
// apps/api/src/jobs/entities/job-step.entity.ts
@Entity('job_steps')
export class JobStep {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  buildJobId: string;

  @ManyToOne(() => BuildJob, job => job.steps, { onDelete: 'CASCADE' })
  buildJob: BuildJob;

  @Column({ type: 'varchar' })
  type: 'concept' | 'sub-concept' | 'knowledge-unit';

  @Column({ type: 'varchar' })
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'skipped';

  // Reference to the entity being processed
  @Column({ nullable: true })
  entityId: string | null;

  @Column({ nullable: true })
  entityName: string | null;

  // Parent reference for hierarchy
  @Column({ nullable: true })
  parentStepId: string | null;

  // Error info
  @Column({ type: 'text', nullable: true })
  error: string | null;

  @Column({ type: 'int', default: 0 })
  attempts: number;

  // Timing
  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date | null;

  // Duration in ms
  @Column({ type: 'int', nullable: true })
  durationMs: number | null;
}
```

---

## Phase 3: Queue Architecture

### 3.1 Queue Definitions

```typescript
// apps/api/src/jobs/queues/queue.constants.ts
export const QUEUES = {
  BUILD_PATH: 'build-path',
  DECOMPOSE_CONCEPT: 'decompose-concept',
  GENERATE_KU: 'generate-ku',
} as const;

export const JOB_NAMES = {
  // Build Path Queue
  START_BUILD: 'start-build',
  GENERATE_CONCEPTS: 'generate-concepts',
  FINALIZE_BUILD: 'finalize-build',

  // Decompose Queue
  DECOMPOSE_CONCEPT: 'decompose-concept',

  // Generate KU Queue
  GENERATE_KU: 'generate-ku',
} as const;
```

### 3.2 Job Data Types

```typescript
// apps/api/src/jobs/queues/job.types.ts
export interface BuildPathJobData {
  buildJobId: string;
  pathId: string;
  triggeredBy: string;
}

export interface GenerateConceptsJobData {
  buildJobId: string;
  pathId: string;
}

export interface DecomposeConceptJobData {
  buildJobId: string;
  conceptId: string;
  conceptName: string;
  conceptIndex: number;
  totalConcepts: number;
}

export interface GenerateKUJobData {
  buildJobId: string;
  subConceptId: string;
  subConceptName: string;
  subConceptIndex: number;
  totalSubConcepts: number;
  parentConceptId: string;
}
```

### 3.3 Flow Pattern (Parent-Child Jobs)

```typescript
// apps/api/src/jobs/flows/build-path.flow.ts
import { FlowProducer } from 'bullmq';

export class BuildPathFlow {
  private flowProducer: FlowProducer;

  constructor(connection: ConnectionOptions) {
    this.flowProducer = new FlowProducer({ connection });
  }

  /**
   * Creates the complete job flow for building a learning path.
   * Uses BullMQ's flow feature for parent-child job dependencies.
   */
  async createBuildFlow(buildJobId: string, pathId: string, concepts: Concept[]) {
    // Create the hierarchical flow
    // Parent job waits for all children to complete

    const flow = await this.flowProducer.add({
      name: JOB_NAMES.FINALIZE_BUILD,
      queueName: QUEUES.BUILD_PATH,
      data: { buildJobId, pathId },
      children: concepts.map((concept, index) => ({
        name: JOB_NAMES.DECOMPOSE_CONCEPT,
        queueName: QUEUES.DECOMPOSE_CONCEPT,
        data: {
          buildJobId,
          conceptId: concept.id,
          conceptName: concept.name,
          conceptIndex: index,
          totalConcepts: concepts.length,
        },
        opts: {
          priority: index, // Process in order by default
        },
      })),
    });

    return flow;
  }
}
```

---

## Phase 4: Workers

### 4.1 Build Path Worker (Orchestrator)

```typescript
// apps/api/src/jobs/workers/build-path.worker.ts
import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
@Processor(QUEUES.BUILD_PATH)
export class BuildPathWorker extends WorkerHost {
  private readonly logger = new Logger(BuildPathWorker.name);

  constructor(
    private readonly buildJobService: BuildJobService,
    private readonly learningMapService: LearningMapService,
    private readonly eventEmitter: JobEventEmitter,
  ) {
    super();
  }

  async process(job: Job<BuildPathJobData>): Promise<any> {
    const { buildJobId, pathId } = job.data;

    this.logger.log(`[BUILD] Starting build for path ${pathId}, job ${buildJobId}`);

    try {
      // Update job status
      await this.buildJobService.updateStatus(buildJobId, 'processing', 'concepts');
      this.eventEmitter.emitProgress(buildJobId, { stage: 'concepts', status: 'started' });

      // Step 1: Generate concepts
      const conceptResult = await this.learningMapService.generateConceptsWithAI(pathId, true);
      const concepts = conceptResult.concepts;

      // Update progress
      await this.buildJobService.updateConceptProgress(buildJobId, {
        totalConcepts: concepts.length,
        completedConcepts: concepts.length,
        totalSubConcepts: concepts.length * 4, // Estimate 4 sub-concepts per concept
      });

      this.eventEmitter.emitProgress(buildJobId, {
        stage: 'concepts',
        status: 'completed',
        count: concepts.length,
      });

      // Return concepts for the flow to use
      return { concepts, buildJobId, pathId };

    } catch (error) {
      this.logger.error(`[BUILD] Failed: ${error.message}`);
      await this.buildJobService.recordError(buildJobId, error.message);
      this.eventEmitter.emitError(buildJobId, error.message);
      throw error; // Re-throw to trigger BullMQ retry
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`[BUILD] Job ${job.id} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`[BUILD] Job ${job.id} failed: ${error.message}`);
  }
}
```

### 4.2 Decompose Concept Worker

```typescript
// apps/api/src/jobs/workers/decompose-concept.worker.ts
@Injectable()
@Processor(QUEUES.DECOMPOSE_CONCEPT, {
  concurrency: 3, // Process 3 concepts in parallel
})
export class DecomposeConceptWorker extends WorkerHost {
  private readonly logger = new Logger(DecomposeConceptWorker.name);

  constructor(
    private readonly buildJobService: BuildJobService,
    private readonly learningMapService: LearningMapService,
    private readonly generateKUQueue: InjectQueue(QUEUES.GENERATE_KU),
    private readonly eventEmitter: JobEventEmitter,
  ) {
    super();
  }

  async process(job: Job<DecomposeConceptJobData>): Promise<any> {
    const { buildJobId, conceptId, conceptName, conceptIndex, totalConcepts } = job.data;

    this.logger.log(`[DECOMPOSE] Processing concept ${conceptIndex + 1}/${totalConcepts}: ${conceptName}`);

    try {
      // Emit progress update
      this.eventEmitter.emitProgress(buildJobId, {
        stage: 'sub-concepts',
        current: conceptIndex + 1,
        total: totalConcepts,
        item: conceptName,
      });

      // Decompose the concept
      const result = await this.learningMapService.decomposeIntoSubConcepts(conceptId);
      const subConcepts = result.subConcepts;

      // Update build job progress
      await this.buildJobService.incrementSubConceptCount(buildJobId, subConcepts.length);

      // Queue KU generation for each sub-concept
      const kuJobs = subConcepts.map((sc, idx) => ({
        name: JOB_NAMES.GENERATE_KU,
        data: {
          buildJobId,
          subConceptId: sc.id,
          subConceptName: sc.name,
          subConceptIndex: idx,
          totalSubConcepts: subConcepts.length,
          parentConceptId: conceptId,
        } as GenerateKUJobData,
        opts: {
          priority: conceptIndex * 100 + idx, // Maintain ordering
        },
      }));

      await this.generateKUQueue.addBulk(kuJobs);

      this.logger.log(`[DECOMPOSE] Created ${subConcepts.length} sub-concepts, queued ${kuJobs.length} KU jobs`);

      return { subConcepts, conceptId };

    } catch (error) {
      this.logger.error(`[DECOMPOSE] Failed for ${conceptName}: ${error.message}`);

      // Record error but don't fail the whole build
      await this.buildJobService.recordStepError(buildJobId, 'concept', conceptId, error.message);

      // Emit error event
      this.eventEmitter.emitStepError(buildJobId, {
        stage: 'sub-concepts',
        item: conceptName,
        error: error.message,
      });

      // Return empty to continue with other concepts
      return { subConcepts: [], conceptId, error: error.message };
    }
  }
}
```

### 4.3 Generate KU Worker

```typescript
// apps/api/src/jobs/workers/generate-ku.worker.ts
@Injectable()
@Processor(QUEUES.GENERATE_KU, {
  concurrency: 5, // Process 5 sub-concepts in parallel
  limiter: {
    max: 10,      // Max 10 jobs per duration
    duration: 60000, // Per minute (rate limiting for AI API)
  },
})
export class GenerateKUWorker extends WorkerHost {
  private readonly logger = new Logger(GenerateKUWorker.name);

  constructor(
    private readonly buildJobService: BuildJobService,
    private readonly learningMapService: LearningMapService,
    private readonly eventEmitter: JobEventEmitter,
  ) {
    super();
  }

  async process(job: Job<GenerateKUJobData>): Promise<any> {
    const { buildJobId, subConceptId, subConceptName, subConceptIndex, totalSubConcepts } = job.data;

    this.logger.log(`[GENERATE_KU] Processing sub-concept: ${subConceptName}`);

    try {
      // Emit progress
      this.eventEmitter.emitProgress(buildJobId, {
        stage: 'knowledge-units',
        item: subConceptName,
        subIndex: subConceptIndex,
        subTotal: totalSubConcepts,
      });

      // Generate KUs
      const result = await this.learningMapService.generateStructuredKU(subConceptId);
      const kus = result.knowledgeUnits;

      // Update progress
      await this.buildJobService.incrementKUCount(buildJobId, kus.length);

      this.eventEmitter.emitProgress(buildJobId, {
        stage: 'knowledge-units',
        item: subConceptName,
        status: 'completed',
        count: kus.length,
      });

      return { knowledgeUnits: kus, subConceptId };

    } catch (error) {
      this.logger.error(`[GENERATE_KU] Failed for ${subConceptName}: ${error.message}`);

      await this.buildJobService.recordStepError(buildJobId, 'sub-concept', subConceptId, error.message);

      this.eventEmitter.emitStepError(buildJobId, {
        stage: 'knowledge-units',
        item: subConceptName,
        error: error.message,
      });

      // Continue with other sub-concepts
      return { knowledgeUnits: [], subConceptId, error: error.message };
    }
  }
}
```

---

## Phase 5: API Layer

### 5.1 Jobs Controller

```typescript
// apps/api/src/jobs/jobs.controller.ts
@Controller('jobs')
@UseGuards(JwtAuthGuard)
export class JobsController {
  constructor(
    private readonly jobsService: JobsService,
    private readonly eventEmitter: JobEventEmitter,
  ) {}

  /**
   * Start a new build job for a learning path
   */
  @Post('build/:pathId')
  async startBuild(
    @Param('pathId') pathId: string,
    @Request() req,
  ): Promise<{ jobId: string; message: string }> {
    const userId = req.user.id;

    // Check if there's already an active build for this path
    const activeJob = await this.jobsService.getActiveJobForPath(pathId);
    if (activeJob) {
      throw new ConflictException(`Build already in progress for this path. Job ID: ${activeJob.id}`);
    }

    const job = await this.jobsService.createBuildJob(pathId, userId);

    return {
      jobId: job.id,
      message: 'Build job started',
    };
  }

  /**
   * Get job status and progress
   */
  @Get(':jobId')
  async getJob(@Param('jobId') jobId: string): Promise<BuildJob> {
    return this.jobsService.getJob(jobId);
  }

  /**
   * Get all jobs for a learning path
   */
  @Get('path/:pathId')
  async getJobsForPath(@Param('pathId') pathId: string): Promise<BuildJob[]> {
    return this.jobsService.getJobsForPath(pathId);
  }

  /**
   * Get all jobs (admin)
   */
  @Get()
  async getAllJobs(
    @Query('status') status?: BuildJobStatus,
    @Query('limit') limit = 50,
  ): Promise<BuildJob[]> {
    return this.jobsService.getAllJobs({ status, limit });
  }

  /**
   * Cancel a running job
   */
  @Post(':jobId/cancel')
  async cancelJob(@Param('jobId') jobId: string): Promise<{ success: boolean }> {
    await this.jobsService.cancelJob(jobId);
    return { success: true };
  }

  /**
   * Retry a failed job
   */
  @Post(':jobId/retry')
  async retryJob(@Param('jobId') jobId: string): Promise<{ jobId: string }> {
    const newJob = await this.jobsService.retryJob(jobId);
    return { jobId: newJob.id };
  }

  /**
   * SSE endpoint for real-time progress updates
   */
  @Sse(':jobId/stream')
  streamProgress(@Param('jobId') jobId: string): Observable<MessageEvent> {
    return this.eventEmitter.getProgressStream(jobId);
  }

  /**
   * Get detailed steps for a job
   */
  @Get(':jobId/steps')
  async getJobSteps(@Param('jobId') jobId: string): Promise<JobStep[]> {
    return this.jobsService.getJobSteps(jobId);
  }
}
```

### 5.2 Jobs Service

```typescript
// apps/api/src/jobs/jobs.service.ts
@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(BuildJob)
    private buildJobRepository: Repository<BuildJob>,
    @InjectRepository(JobStep)
    private jobStepRepository: Repository<JobStep>,
    @InjectQueue(QUEUES.BUILD_PATH)
    private buildPathQueue: Queue,
  ) {}

  async createBuildJob(pathId: string, triggeredBy: string): Promise<BuildJob> {
    // Create database record
    const buildJob = this.buildJobRepository.create({
      pathId,
      triggeredBy,
      status: 'pending',
    });

    const saved = await this.buildJobRepository.save(buildJob);

    // Add to BullMQ queue
    const bullJob = await this.buildPathQueue.add(
      JOB_NAMES.START_BUILD,
      {
        buildJobId: saved.id,
        pathId,
        triggeredBy,
      } as BuildPathJobData,
      {
        jobId: saved.id, // Use our ID as BullMQ job ID
      }
    );

    // Update with BullMQ reference
    saved.bullJobId = bullJob.id;
    await this.buildJobRepository.save(saved);

    return saved;
  }

  async getJob(jobId: string): Promise<BuildJob> {
    const job = await this.buildJobRepository.findOne({
      where: { id: jobId },
      relations: ['learningPath'],
    });

    if (!job) {
      throw new NotFoundException(`Job ${jobId} not found`);
    }

    return job;
  }

  async updateStatus(
    jobId: string,
    status: BuildJobStatus,
    stage?: BuildJobStage,
  ): Promise<void> {
    const updates: Partial<BuildJob> = { status };

    if (stage) {
      updates.currentStage = stage;
    }

    if (status === 'processing' && !updates.startedAt) {
      updates.startedAt = new Date();
    }

    if (status === 'completed' || status === 'failed') {
      updates.completedAt = new Date();
    }

    await this.buildJobRepository.update(jobId, updates);
  }

  async cancelJob(jobId: string): Promise<void> {
    const job = await this.getJob(jobId);

    if (job.status === 'completed' || job.status === 'cancelled') {
      throw new BadRequestException('Cannot cancel a completed or already cancelled job');
    }

    // Remove from BullMQ queue if pending
    if (job.bullJobId) {
      const bullJob = await this.buildPathQueue.getJob(job.bullJobId);
      if (bullJob) {
        await bullJob.remove();
      }
    }

    await this.updateStatus(jobId, 'cancelled');
  }

  async retryJob(jobId: string): Promise<BuildJob> {
    const job = await this.getJob(jobId);

    if (job.status !== 'failed') {
      throw new BadRequestException('Can only retry failed jobs');
    }

    // Create a new job for the same path
    return this.createBuildJob(job.pathId, job.triggeredBy);
  }

  // Progress update methods
  async updateConceptProgress(jobId: string, progress: {
    totalConcepts?: number;
    completedConcepts?: number;
    totalSubConcepts?: number;
  }): Promise<void> {
    await this.buildJobRepository.update(jobId, progress);
  }

  async incrementSubConceptCount(jobId: string, count: number): Promise<void> {
    await this.buildJobRepository.increment({ id: jobId }, 'completedSubConcepts', 1);
    await this.buildJobRepository.increment({ id: jobId }, 'totalKnowledgeUnits', count * 4); // Estimate
  }

  async incrementKUCount(jobId: string, count: number): Promise<void> {
    await this.buildJobRepository.increment({ id: jobId }, 'completedKnowledgeUnits', count);
  }

  async recordError(jobId: string, error: string): Promise<void> {
    await this.buildJobRepository.update(jobId, {
      error,
      status: 'failed',
      completedAt: new Date(),
    });
    await this.buildJobRepository.increment({ id: jobId }, 'errorCount', 1);
  }
}
```

### 5.3 SSE Event Emitter

```typescript
// apps/api/src/jobs/events/job-event-emitter.ts
import { Injectable } from '@nestjs/common';
import { Subject, Observable, filter, map } from 'rxjs';

export interface JobProgressEvent {
  jobId: string;
  type: 'progress' | 'error' | 'completed';
  data: any;
  timestamp: Date;
}

@Injectable()
export class JobEventEmitter {
  private events$ = new Subject<JobProgressEvent>();

  emitProgress(jobId: string, data: any): void {
    this.events$.next({
      jobId,
      type: 'progress',
      data,
      timestamp: new Date(),
    });
  }

  emitError(jobId: string, error: string): void {
    this.events$.next({
      jobId,
      type: 'error',
      data: { error },
      timestamp: new Date(),
    });
  }

  emitCompleted(jobId: string, summary: any): void {
    this.events$.next({
      jobId,
      type: 'completed',
      data: summary,
      timestamp: new Date(),
    });
  }

  emitStepError(jobId: string, data: any): void {
    this.events$.next({
      jobId,
      type: 'error',
      data: { ...data, isStepError: true },
      timestamp: new Date(),
    });
  }

  getProgressStream(jobId: string): Observable<MessageEvent> {
    return this.events$.pipe(
      filter(event => event.jobId === jobId),
      map(event => ({
        data: JSON.stringify(event),
      } as MessageEvent)),
    );
  }
}
```

---

## Phase 6: Frontend Integration

### 6.1 Jobs Service (Angular)

```typescript
// libs/core-data/src/lib/services/jobs/jobs.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../config/api-url.token';

export interface BuildJob {
  id: string;
  pathId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  currentStage: 'concepts' | 'sub-concepts' | 'knowledge-units' | null;
  totalConcepts: number;
  completedConcepts: number;
  totalSubConcepts: number;
  completedSubConcepts: number;
  totalKnowledgeUnits: number;
  completedKnowledgeUnits: number;
  error: string | null;
  progressPercent: number;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
}

export interface JobProgressEvent {
  jobId: string;
  type: 'progress' | 'error' | 'completed';
  data: any;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class JobsService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  /**
   * Start a new build job
   */
  startBuild(pathId: string): Observable<{ jobId: string; message: string }> {
    return this.http.post<{ jobId: string; message: string }>(
      `${this.apiUrl}/jobs/build/${pathId}`,
      {}
    );
  }

  /**
   * Get job status
   */
  getJob(jobId: string): Observable<BuildJob> {
    return this.http.get<BuildJob>(`${this.apiUrl}/jobs/${jobId}`);
  }

  /**
   * Get jobs for a path
   */
  getJobsForPath(pathId: string): Observable<BuildJob[]> {
    return this.http.get<BuildJob[]>(`${this.apiUrl}/jobs/path/${pathId}`);
  }

  /**
   * Cancel a job
   */
  cancelJob(jobId: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(
      `${this.apiUrl}/jobs/${jobId}/cancel`,
      {}
    );
  }

  /**
   * Retry a failed job
   */
  retryJob(jobId: string): Observable<{ jobId: string }> {
    return this.http.post<{ jobId: string }>(
      `${this.apiUrl}/jobs/${jobId}/retry`,
      {}
    );
  }

  /**
   * Connect to SSE stream for real-time progress
   */
  streamProgress(jobId: string): Observable<JobProgressEvent> {
    return new Observable(subscriber => {
      const eventSource = new EventSource(
        `${this.apiUrl}/jobs/${jobId}/stream`
      );

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          subscriber.next(data);
        } catch (e) {
          console.error('Failed to parse SSE event:', e);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE error:', error);
        // Don't complete on error - SSE will reconnect
      };

      // Cleanup on unsubscribe
      return () => {
        eventSource.close();
      };
    });
  }
}
```

### 6.2 Build Job State (NgRx)

```typescript
// libs/core-state/src/lib/build-jobs/build-jobs.actions.ts
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { BuildJob, JobProgressEvent } from '@kasita/core-data';

export const BuildJobsActions = createActionGroup({
  source: 'Build Jobs',
  events: {
    // Start build
    'Start Build': props<{ pathId: string }>(),
    'Start Build Success': props<{ job: BuildJob }>(),
    'Start Build Failure': props<{ error: string }>(),

    // Load job
    'Load Job': props<{ jobId: string }>(),
    'Load Job Success': props<{ job: BuildJob }>(),
    'Load Job Failure': props<{ error: string }>(),

    // SSE updates
    'Subscribe To Progress': props<{ jobId: string }>(),
    'Unsubscribe From Progress': emptyProps(),
    'Progress Update': props<{ event: JobProgressEvent }>(),

    // Actions
    'Cancel Job': props<{ jobId: string }>(),
    'Cancel Job Success': props<{ jobId: string }>(),
    'Retry Job': props<{ jobId: string }>(),
    'Retry Job Success': props<{ job: BuildJob }>(),

    // Clear
    'Clear Current Job': emptyProps(),
  },
});
```

```typescript
// libs/core-state/src/lib/build-jobs/build-jobs.feature.ts
import { createFeature, createReducer, on } from '@ngrx/store';
import { BuildJob, JobProgressEvent } from '@kasita/core-data';
import { BuildJobsActions } from './build-jobs.actions';

export interface BuildJobsState {
  currentJob: BuildJob | null;
  progressEvents: JobProgressEvent[];
  isStarting: boolean;
  error: string | null;
}

const initialState: BuildJobsState = {
  currentJob: null,
  progressEvents: [],
  isStarting: false,
  error: null,
};

export const buildJobsFeature = createFeature({
  name: 'buildJobs',
  reducer: createReducer(
    initialState,

    on(BuildJobsActions.startBuild, (state) => ({
      ...state,
      isStarting: true,
      error: null,
    })),

    on(BuildJobsActions.startBuildSuccess, (state, { job }) => ({
      ...state,
      currentJob: job,
      isStarting: false,
      progressEvents: [],
    })),

    on(BuildJobsActions.startBuildFailure, (state, { error }) => ({
      ...state,
      isStarting: false,
      error,
    })),

    on(BuildJobsActions.loadJobSuccess, (state, { job }) => ({
      ...state,
      currentJob: job,
    })),

    on(BuildJobsActions.progressUpdate, (state, { event }) => ({
      ...state,
      progressEvents: [...state.progressEvents, event],
      // Update job status from event if available
      currentJob: state.currentJob ? {
        ...state.currentJob,
        ...(event.type === 'completed' ? { status: 'completed' } : {}),
        ...(event.type === 'error' && !event.data.isStepError ? { status: 'failed', error: event.data.error } : {}),
      } : null,
    })),

    on(BuildJobsActions.cancelJobSuccess, (state, { jobId }) => ({
      ...state,
      currentJob: state.currentJob?.id === jobId
        ? { ...state.currentJob, status: 'cancelled' }
        : state.currentJob,
    })),

    on(BuildJobsActions.clearCurrentJob, () => initialState),
  ),
});

export const {
  selectCurrentJob,
  selectProgressEvents,
  selectIsStarting,
  selectError,
} = buildJobsFeature;
```

### 6.3 Build Progress Component

```typescript
// apps/dashboard/src/app/learning-paths/build-progress/build-progress.ts
import { Component, computed, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '@kasita/material';
import { BuildJob, JobProgressEvent } from '@kasita/core-data';

@Component({
  selector: 'app-build-progress',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  template: `
    <div class="build-progress-panel" [class.expanded]="expanded()">
      <div class="progress-header" (click)="toggleExpanded()">
        <div class="header-left">
          <mat-icon [class]="statusClass()">{{ statusIcon() }}</mat-icon>
          <span class="status-text">{{ statusText() }}</span>
        </div>
        <div class="header-right">
          <span class="progress-percent">{{ job()?.progressPercent || 0 }}%</span>
          <mat-icon class="expand-icon">
            {{ expanded() ? 'expand_less' : 'expand_more' }}
          </mat-icon>
        </div>
      </div>

      @if (expanded()) {
        <div class="progress-details">
          <!-- Progress bars -->
          <div class="stage-progress">
            <div class="stage">
              <span class="stage-label">Concepts</span>
              <mat-progress-bar
                mode="determinate"
                [value]="conceptProgress()"
              ></mat-progress-bar>
              <span class="stage-count">
                {{ job()?.completedConcepts || 0 }}/{{ job()?.totalConcepts || 0 }}
              </span>
            </div>

            <div class="stage">
              <span class="stage-label">Sub-concepts</span>
              <mat-progress-bar
                mode="determinate"
                [value]="subConceptProgress()"
              ></mat-progress-bar>
              <span class="stage-count">
                {{ job()?.completedSubConcepts || 0 }}/{{ job()?.totalSubConcepts || 0 }}
              </span>
            </div>

            <div class="stage">
              <span class="stage-label">Knowledge Units</span>
              <mat-progress-bar
                mode="determinate"
                [value]="kuProgress()"
              ></mat-progress-bar>
              <span class="stage-count">
                {{ job()?.completedKnowledgeUnits || 0 }}/{{ job()?.totalKnowledgeUnits || 0 }}
              </span>
            </div>
          </div>

          <!-- Current activity -->
          @if (latestEvent()) {
            <div class="current-activity">
              <mat-icon>{{ latestEvent()?.type === 'error' ? 'warning' : 'arrow_forward' }}</mat-icon>
              <span>{{ formatEvent(latestEvent()) }}</span>
            </div>
          }

          <!-- Actions -->
          <div class="progress-actions">
            @if (job()?.status === 'processing') {
              <button mat-button color="warn" (click)="cancel.emit()">
                <mat-icon>cancel</mat-icon>
                Cancel
              </button>
            }
            @if (job()?.status === 'failed') {
              <button mat-button color="primary" (click)="retry.emit()">
                <mat-icon>refresh</mat-icon>
                Retry
              </button>
            }
          </div>

          <!-- Error display -->
          @if (job()?.error) {
            <div class="error-message">
              <mat-icon>error</mat-icon>
              {{ job()?.error }}
            </div>
          }

          <!-- Recent events log -->
          <div class="events-log">
            <h4>Activity Log</h4>
            <div class="events-list">
              @for (event of recentEvents(); track event.timestamp) {
                <div class="event-item" [class]="event.type">
                  <span class="event-time">{{ formatTime(event.timestamp) }}</span>
                  <span class="event-text">{{ formatEvent(event) }}</span>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styleUrl: './build-progress.scss',
})
export class BuildProgress {
  job = input<BuildJob | null>(null);
  events = input<JobProgressEvent[]>([]);

  cancel = output<void>();
  retry = output<void>();

  expanded = signal(true);

  statusIcon = computed(() => {
    switch (this.job()?.status) {
      case 'pending': return 'schedule';
      case 'processing': return 'sync';
      case 'completed': return 'check_circle';
      case 'failed': return 'error';
      case 'cancelled': return 'cancel';
      default: return 'help';
    }
  });

  statusClass = computed(() => `status-${this.job()?.status || 'pending'}`);

  statusText = computed(() => {
    const job = this.job();
    if (!job) return 'No build in progress';

    switch (job.status) {
      case 'pending': return 'Build queued...';
      case 'processing': return `Building ${job.currentStage}...`;
      case 'completed': return 'Build completed!';
      case 'failed': return 'Build failed';
      case 'cancelled': return 'Build cancelled';
      default: return 'Unknown status';
    }
  });

  conceptProgress = computed(() => {
    const job = this.job();
    if (!job?.totalConcepts) return 0;
    return (job.completedConcepts / job.totalConcepts) * 100;
  });

  subConceptProgress = computed(() => {
    const job = this.job();
    if (!job?.totalSubConcepts) return 0;
    return (job.completedSubConcepts / job.totalSubConcepts) * 100;
  });

  kuProgress = computed(() => {
    const job = this.job();
    if (!job?.totalKnowledgeUnits) return 0;
    return (job.completedKnowledgeUnits / job.totalKnowledgeUnits) * 100;
  });

  latestEvent = computed(() => {
    const events = this.events();
    return events[events.length - 1] || null;
  });

  recentEvents = computed(() => {
    return this.events().slice(-20).reverse();
  });

  toggleExpanded() {
    this.expanded.update(v => !v);
  }

  formatEvent(event: JobProgressEvent | null): string {
    if (!event) return '';

    if (event.type === 'error') {
      return `Error: ${event.data.error}`;
    }

    if (event.data.item) {
      return `${event.data.stage}: ${event.data.item}`;
    }

    return `${event.data.stage}: ${event.data.status || 'processing'}`;
  }

  formatTime(timestamp: string): string {
    return new Date(timestamp).toLocaleTimeString();
  }
}
```

### 6.4 Updated Learning Paths Component

```typescript
// Simplified usage in learning-paths.ts
export class LearningPaths {
  private jobsService = inject(JobsService);
  private store = inject(Store);

  // State from store
  currentJob = this.store.selectSignal(selectCurrentJob);
  progressEvents = this.store.selectSignal(selectProgressEvents);
  isStartingBuild = this.store.selectSignal(selectIsStarting);

  // Check for active job on init
  ngOnInit() {
    this.checkForActiveJob();
  }

  async checkForActiveJob() {
    const pathId = this.selectedLearningPath()?.id;
    if (!pathId) return;

    // Check if there's an active build
    const jobs = await firstValueFrom(this.jobsService.getJobsForPath(pathId));
    const activeJob = jobs.find(j => j.status === 'pending' || j.status === 'processing');

    if (activeJob) {
      // Resume tracking
      this.store.dispatch(BuildJobsActions.loadJobSuccess({ job: activeJob }));
      this.store.dispatch(BuildJobsActions.subscribeToProgress({ jobId: activeJob.id }));
    }
  }

  buildLearningPath() {
    const pathId = this.selectedLearningPath()?.id;
    if (!pathId) return;

    this.store.dispatch(BuildJobsActions.startBuild({ pathId }));
  }

  cancelBuild() {
    const jobId = this.currentJob()?.id;
    if (!jobId) return;

    this.store.dispatch(BuildJobsActions.cancelJob({ jobId }));
  }

  retryBuild() {
    const jobId = this.currentJob()?.id;
    if (!jobId) return;

    this.store.dispatch(BuildJobsActions.retryJob({ jobId }));
  }
}
```

---

## Phase 7: Admin Dashboard

### 7.1 Job Queue Admin Panel

```typescript
// apps/dashboard/src/app/admin/job-queue/job-queue.ts
@Component({
  selector: 'app-job-queue-admin',
  template: `
    <div class="admin-panel">
      <h1>Job Queue Administration</h1>

      <!-- Queue Stats -->
      <div class="queue-stats">
        <div class="stat-card">
          <span class="stat-value">{{ stats()?.active || 0 }}</span>
          <span class="stat-label">Active</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ stats()?.waiting || 0 }}</span>
          <span class="stat-label">Waiting</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ stats()?.completed || 0 }}</span>
          <span class="stat-label">Completed (24h)</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ stats()?.failed || 0 }}</span>
          <span class="stat-label">Failed</span>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters">
        <mat-form-field>
          <mat-select [(value)]="statusFilter" (selectionChange)="loadJobs()">
            <mat-option value="">All</mat-option>
            <mat-option value="processing">Processing</mat-option>
            <mat-option value="pending">Pending</mat-option>
            <mat-option value="failed">Failed</mat-option>
            <mat-option value="completed">Completed</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <!-- Jobs Table -->
      <table mat-table [dataSource]="jobs()">
        <ng-container matColumnDef="id">
          <th mat-header-cell *matHeaderCellDef>Job ID</th>
          <td mat-cell *matCellDef="let job">{{ job.id | slice:0:8 }}...</td>
        </ng-container>

        <ng-container matColumnDef="path">
          <th mat-header-cell *matHeaderCellDef>Learning Path</th>
          <td mat-cell *matCellDef="let job">{{ job.learningPath?.name }}</td>
        </ng-container>

        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef>Status</th>
          <td mat-cell *matCellDef="let job">
            <span class="status-badge" [class]="job.status">{{ job.status }}</span>
          </td>
        </ng-container>

        <ng-container matColumnDef="progress">
          <th mat-header-cell *matHeaderCellDef>Progress</th>
          <td mat-cell *matCellDef="let job">
            <mat-progress-bar [value]="job.progressPercent"></mat-progress-bar>
            {{ job.progressPercent }}%
          </td>
        </ng-container>

        <ng-container matColumnDef="created">
          <th mat-header-cell *matHeaderCellDef>Created</th>
          <td mat-cell *matCellDef="let job">{{ job.createdAt | date:'short' }}</td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let job">
            <button mat-icon-button (click)="viewDetails(job)">
              <mat-icon>visibility</mat-icon>
            </button>
            @if (job.status === 'processing' || job.status === 'pending') {
              <button mat-icon-button color="warn" (click)="cancelJob(job)">
                <mat-icon>cancel</mat-icon>
              </button>
            }
            @if (job.status === 'failed') {
              <button mat-icon-button color="primary" (click)="retryJob(job)">
                <mat-icon>refresh</mat-icon>
              </button>
            }
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
    </div>
  `,
})
export class JobQueueAdmin {
  // Implementation...
}
```

---

## Phase 8: Monitoring & Observability

### 8.1 BullMQ Board (Development)

```typescript
// apps/api/src/jobs/bull-board.module.ts
import { Module } from '@nestjs/common';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';

@Module({
  imports: [
    BullBoardModule.forRoot({
      route: '/admin/queues',
      adapter: ExpressAdapter,
    }),
    BullBoardModule.forFeature({
      name: QUEUES.BUILD_PATH,
      adapter: BullMQAdapter,
    }),
    BullBoardModule.forFeature({
      name: QUEUES.DECOMPOSE_CONCEPT,
      adapter: BullMQAdapter,
    }),
    BullBoardModule.forFeature({
      name: QUEUES.GENERATE_KU,
      adapter: BullMQAdapter,
    }),
  ],
})
export class BullBoardSetupModule {}
```

### 8.2 Metrics & Health Checks

```typescript
// apps/api/src/jobs/health/queue-health.indicator.ts
import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthCheckError } from '@nestjs/terminus';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class QueueHealthIndicator extends HealthIndicator {
  constructor(
    @InjectQueue(QUEUES.BUILD_PATH) private buildQueue: Queue,
  ) {
    super();
  }

  async isHealthy(key: string) {
    try {
      await this.buildQueue.client.ping();

      const waiting = await this.buildQueue.getWaitingCount();
      const active = await this.buildQueue.getActiveCount();

      return this.getStatus(key, true, {
        waiting,
        active,
      });
    } catch (error) {
      throw new HealthCheckError(
        'Queue health check failed',
        this.getStatus(key, false, { error: error.message }),
      );
    }
  }
}
```

---

## Phase 9: Error Handling & Recovery

### 9.1 Dead Letter Queue

```typescript
// apps/api/src/jobs/workers/dead-letter.worker.ts
@Injectable()
@Processor('dead-letter')
export class DeadLetterWorker extends WorkerHost {
  private readonly logger = new Logger(DeadLetterWorker.name);

  constructor(
    private readonly alertService: AlertService,
    private readonly buildJobService: BuildJobService,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    this.logger.error(`Job moved to dead letter queue: ${job.id}`);
    this.logger.error(`Original queue: ${job.data.originalQueue}`);
    this.logger.error(`Error: ${job.failedReason}`);

    // Update build job if applicable
    if (job.data.buildJobId) {
      await this.buildJobService.recordError(
        job.data.buildJobId,
        `Step failed permanently: ${job.failedReason}`
      );
    }

    // Send alert (email, Slack, etc.)
    await this.alertService.sendJobFailureAlert({
      jobId: job.id,
      queue: job.data.originalQueue,
      error: job.failedReason,
      data: job.data,
    });
  }
}
```

### 9.2 Graceful Shutdown

```typescript
// apps/api/src/main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Graceful shutdown
  app.enableShutdownHooks();

  const workers = app.get(WorkerService);

  process.on('SIGTERM', async () => {
    console.log('Received SIGTERM, gracefully shutting down...');

    // Stop accepting new jobs
    await workers.pauseAll();

    // Wait for active jobs to complete (max 30 seconds)
    await workers.waitForActiveJobs(30000);

    // Close connections
    await app.close();
  });

  await app.listen(3333);
}
```

---

## Implementation Roadmap

### Week 1: Foundation
- [ ] Set up Redis (Docker for dev, choose production provider)
- [ ] Install and configure BullMQ in NestJS
- [ ] Create BuildJob and JobStep entities
- [ ] Implement basic JobsService and JobsController
- [ ] Create build-path queue and worker

### Week 2: Fan-Out Pattern
- [ ] Implement decompose-concept queue and worker
- [ ] Implement generate-ku queue and worker
- [ ] Wire up parent-child job relationships
- [ ] Test parallel execution

### Week 3: Frontend Integration
- [ ] Create JobsService (Angular)
- [ ] Add NgRx state for build jobs
- [ ] Implement SSE streaming in frontend
- [ ] Create BuildProgress component
- [ ] Update LearningPaths to use new system

### Week 4: Admin & Monitoring
- [ ] Set up Bull Board for development
- [ ] Create Job Queue Admin panel
- [ ] Implement health checks
- [ ] Add error alerting
- [ ] Test graceful shutdown

### Week 5: Polish & Production
- [ ] Load testing
- [ ] Error recovery testing
- [ ] Documentation
- [ ] Production Redis setup
- [ ] Deploy and monitor

---

## Configuration Checklist

### Environment Variables

```env
# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Job Configuration
JOB_CONCURRENCY_DECOMPOSE=3
JOB_CONCURRENCY_GENERATE_KU=5
JOB_RATE_LIMIT_MAX=10
JOB_RATE_LIMIT_DURATION=60000

# Retry Configuration
JOB_MAX_ATTEMPTS=3
JOB_BACKOFF_TYPE=exponential
JOB_BACKOFF_DELAY=1000
```

### Production Considerations

1. **Redis High Availability**
   - Use Redis Sentinel or Redis Cluster
   - Enable AOF persistence
   - Set up monitoring and alerts

2. **Worker Scaling**
   - Run workers as separate processes
   - Use PM2 or Kubernetes for process management
   - Scale workers based on queue depth

3. **Security**
   - Secure Redis with authentication
   - Use TLS for Redis connections
   - Restrict Bull Board access to admins

4. **Monitoring**
   - Track queue depth, processing time, error rates
   - Set up alerts for stuck jobs
   - Monitor Redis memory usage

---

## Summary

This plan provides a production-grade solution for handling long-running learning path builds with:

- **Resilience**: Jobs persist in Redis, survive browser/server restarts
- **Parallelism**: Concepts and sub-concepts processed concurrently
- **Visibility**: Real-time progress via SSE, admin dashboard for oversight
- **Reliability**: Automatic retries, dead letter queue, graceful shutdown
- **Scalability**: Horizontal scaling via worker processes

The implementation is broken into manageable phases, starting with core infrastructure and progressively adding features.
