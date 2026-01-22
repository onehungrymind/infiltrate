import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { QUEUE_NAMES, JOB_NAMES } from '../jobs/queues/queue.constants';
import {
  GenerateClassroomForPathJobData,
  GenerateClassroomContentJobData,
} from '../jobs/queues/job-data.types';
import { ClassroomService } from './classroom.service';
import {
  ContentListQueryDto,
  UpdateContentDto,
  GenerateForPathDto,
  GenerateForSubConceptDto,
} from './dto/admin.dto';

@Controller('admin/classroom')
@UseGuards(JwtAuthGuard)
export class ClassroomAdminController {
  constructor(
    private readonly classroomService: ClassroomService,
    @InjectQueue(QUEUE_NAMES.CLASSROOM_GENERATION)
    private readonly classroomQueue: Queue<GenerateClassroomForPathJobData | GenerateClassroomContentJobData>,
  ) {}

  // ==================== STATUS & REPORTING ====================

  /**
   * Get overview stats for all classroom content
   */
  @Get('overview')
  async getOverview() {
    return await this.classroomService.getOverviewStats();
  }

  /**
   * Get detailed status for a specific learning path
   */
  @Get('paths/:learningPathId/status')
  async getPathStatus(@Param('learningPathId') learningPathId: string) {
    return await this.classroomService.getDetailedPathStatus(learningPathId);
  }

  /**
   * Get paginated list of all classroom content
   */
  @Get('content')
  async getContentList(@Query() query: ContentListQueryDto) {
    return await this.classroomService.getContentList(query);
  }

  /**
   * Get single content item with full details
   */
  @Get('content/:contentId')
  async getContent(@Param('contentId') contentId: string) {
    return await this.classroomService.getContentById(contentId);
  }

  /**
   * Get all content with error status
   */
  @Get('errors')
  async getErrors() {
    return await this.classroomService.getContentWithErrors();
  }

  // ==================== GENERATION MANAGEMENT ====================

  /**
   * Generate classroom content for entire learning path
   */
  @Post('paths/:learningPathId/generate')
  async generateForPath(
    @Param('learningPathId') learningPathId: string,
    @Body() dto: GenerateForPathDto,
  ) {
    // Get learning path info
    const pathInfo = await this.classroomService.getLearningPathInfo(learningPathId);

    // If force, clear existing content first
    if (dto.force) {
      await this.classroomService.clearPathContent(learningPathId);
    }

    // Queue generation job
    const job = await this.classroomQueue.add(
      JOB_NAMES.GENERATE_CLASSROOM_FOR_PATH,
      {
        learningPathId,
        learningPathName: pathInfo.name,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      },
    );

    return {
      message: 'Generation started',
      jobId: job.id,
      learningPathId,
    };
  }

  /**
   * Generate content for a single sub-concept
   */
  @Post('sub-concepts/:subConceptId/generate')
  async generateForSubConcept(
    @Param('subConceptId') subConceptId: string,
    @Body() dto: GenerateForSubConceptDto,
  ) {
    // Get sub-concept info
    const info = await this.classroomService.getSubConceptInfo(subConceptId);

    const job = await this.classroomQueue.add(
      JOB_NAMES.GENERATE_CLASSROOM_CONTENT,
      {
        learningPathId: dto.learningPathId || info.learningPathId,
        conceptId: dto.conceptId || info.conceptId,
        conceptName: dto.conceptName || info.conceptName,
        subConceptId,
        subConceptName: info.subConceptName,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      },
    );

    return {
      message: 'Generation started',
      jobId: job.id,
      subConceptId,
    };
  }

  /**
   * Generate content for all sub-concepts in a concept
   */
  @Post('concepts/:conceptId/generate')
  async generateForConcept(@Param('conceptId') conceptId: string) {
    const info = await this.classroomService.getConceptInfo(conceptId);

    // Queue generation for each sub-concept
    const jobs = [];
    for (const subConcept of info.subConcepts) {
      const job = await this.classroomQueue.add(
        JOB_NAMES.GENERATE_CLASSROOM_CONTENT,
        {
          learningPathId: info.learningPathId,
          conceptId,
          conceptName: info.conceptName,
          subConceptId: subConcept.id,
          subConceptName: subConcept.name,
        },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
        },
      );
      jobs.push({ subConceptId: subConcept.id, jobId: job.id });
    }

    return {
      message: 'Generation started for concept',
      conceptId,
      jobs,
    };
  }

  /**
   * Clear all content for a learning path
   */
  @Delete('paths/:learningPathId/content')
  async clearPathContent(@Param('learningPathId') learningPathId: string) {
    const result = await this.classroomService.clearPathContent(learningPathId);
    return {
      message: 'Content cleared',
      ...result,
    };
  }

  // ==================== CONTENT EDITING ====================

  /**
   * Update content (title, summary, sections)
   */
  @Patch('content/:contentId')
  async updateContent(
    @Param('contentId') contentId: string,
    @Body() dto: UpdateContentDto,
  ) {
    return await this.classroomService.updateContent(contentId, dto);
  }

  /**
   * Approve content (mark as reviewed/ready)
   */
  @Post('content/:contentId/approve')
  async approveContent(@Param('contentId') contentId: string) {
    return await this.classroomService.approveContent(contentId);
  }

  /**
   * Regenerate single content item
   */
  @Post('content/:contentId/regenerate')
  async regenerateContent(@Param('contentId') contentId: string) {
    const content = await this.classroomService.getContentById(contentId);
    const info = await this.classroomService.getSubConceptInfo(content.subConceptId);

    const job = await this.classroomQueue.add(
      JOB_NAMES.GENERATE_CLASSROOM_CONTENT,
      {
        learningPathId: content.learningPathId,
        conceptId: content.conceptId,
        conceptName: info.conceptName,
        subConceptId: content.subConceptId,
        subConceptName: info.subConceptName,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      },
    );

    return {
      message: 'Regeneration started',
      jobId: job.id,
      contentId,
    };
  }

  // ==================== JOB MANAGEMENT ====================

  /**
   * Get all classroom generation jobs
   */
  @Get('jobs')
  async getJobs() {
    const waiting = await this.classroomQueue.getWaiting();
    const active = await this.classroomQueue.getActive();
    const completed = await this.classroomQueue.getCompleted(0, 20);
    const failed = await this.classroomQueue.getFailed(0, 20);

    return {
      waiting: waiting.map(j => ({ id: j.id, data: j.data, timestamp: j.timestamp })),
      active: active.map(j => ({ id: j.id, data: j.data, timestamp: j.timestamp, progress: j.progress })),
      completed: completed.map(j => ({ id: j.id, data: j.data, timestamp: j.timestamp, finishedOn: j.finishedOn })),
      failed: failed.map(j => ({ id: j.id, data: j.data, timestamp: j.timestamp, failedReason: j.failedReason })),
    };
  }

  /**
   * Get specific job details
   */
  @Get('jobs/:jobId')
  async getJob(@Param('jobId') jobId: string) {
    const job = await this.classroomQueue.getJob(jobId);
    if (!job) {
      return { error: 'Job not found' };
    }

    return {
      id: job.id,
      data: job.data,
      progress: job.progress,
      state: await job.getState(),
      timestamp: job.timestamp,
      finishedOn: job.finishedOn,
      failedReason: job.failedReason,
    };
  }

  /**
   * Cancel a running job
   */
  @Delete('jobs/:jobId')
  async cancelJob(@Param('jobId') jobId: string) {
    const job = await this.classroomQueue.getJob(jobId);
    if (!job) {
      return { error: 'Job not found' };
    }

    await job.remove();
    return { message: 'Job cancelled', jobId };
  }
}
