import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
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
  RegenerateClassroomContentDto,
} from './dto/classroom-content.dto';
import { UpdateReadingProgressDto } from './dto/reading-progress.dto';
import { UpdateReadingPreferencesDto } from './dto/reading-preferences.dto';
import { SubmitMicroQuizDto } from './dto/micro-quiz.dto';

@Controller('classroom')
@UseGuards(JwtAuthGuard)
export class ClassroomController {
  constructor(
    private readonly classroomService: ClassroomService,
    @InjectQueue(QUEUE_NAMES.CLASSROOM_GENERATION)
    private readonly classroomQueue: Queue<GenerateClassroomForPathJobData | GenerateClassroomContentJobData>,
  ) {}

  // ==================== CLASSROOM CONTENT ====================

  /**
   * Get classroom content for a sub-concept
   */
  @Get('sub-concept/:subConceptId')
  async getContentBySubConcept(@Param('subConceptId') subConceptId: string) {
    return await this.classroomService.findContentBySubConcept(subConceptId);
  }

  /**
   * Get all classroom content for a concept (for long-form reading view)
   */
  @Get('concept/:conceptId')
  async getContentByConcept(@Param('conceptId') conceptId: string) {
    return await this.classroomService.findContentByConcept(conceptId);
  }

  /**
   * Get classroom generation status for a learning path
   */
  @Get('status/:learningPathId')
  async getStatus(@Param('learningPathId') learningPathId: string) {
    return await this.classroomService.getClassroomStatus(learningPathId);
  }

  /**
   * Trigger regeneration of classroom content
   */
  @Post('regenerate')
  async regenerate(@Body() dto: RegenerateClassroomContentDto) {
    let job;

    if (dto.type === 'learning-path') {
      // Queue generation for entire learning path
      job = await this.classroomQueue.add(
        JOB_NAMES.GENERATE_CLASSROOM_FOR_PATH,
        {
          learningPathId: dto.id,
          learningPathName: dto.name || 'Unknown Path',
        },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
        },
      );
    } else if (dto.type === 'sub-concept') {
      // Queue generation for single sub-concept
      job = await this.classroomQueue.add(
        JOB_NAMES.GENERATE_CLASSROOM_CONTENT,
        {
          learningPathId: dto.learningPathId || '',
          conceptId: dto.conceptId || '',
          conceptName: dto.conceptName || '',
          subConceptId: dto.id,
          subConceptName: dto.name || 'Unknown Sub-concept',
        },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
        },
      );
    } else {
      return {
        message: 'Invalid regeneration type',
        type: dto.type,
        id: dto.id,
      };
    }

    return {
      message: 'Regeneration queued',
      type: dto.type,
      id: dto.id,
      jobId: job.id,
    };
  }

  // ==================== READING PROGRESS ====================

  /**
   * Get reading progress for a concept
   */
  @Get('progress/concept/:conceptId')
  async getConceptProgress(
    @Request() req,
    @Param('conceptId') conceptId: string,
  ) {
    return await this.classroomService.getConceptProgress(req.user.userId, conceptId);
  }

  /**
   * Get or create reading progress for specific content
   */
  @Get('progress/:classroomContentId')
  async getProgress(
    @Request() req,
    @Param('classroomContentId') classroomContentId: string,
  ) {
    return await this.classroomService.getOrCreateProgress(
      req.user.userId,
      classroomContentId,
    );
  }

  /**
   * Update reading progress (scroll position, time spent)
   */
  @Patch('progress/:classroomContentId')
  async updateProgress(
    @Request() req,
    @Param('classroomContentId') classroomContentId: string,
    @Body() dto: UpdateReadingProgressDto,
  ) {
    return await this.classroomService.updateProgress(
      req.user.userId,
      classroomContentId,
      dto,
    );
  }

  /**
   * Mark content as complete
   */
  @Post('progress/:classroomContentId/complete')
  async markComplete(
    @Request() req,
    @Param('classroomContentId') classroomContentId: string,
  ) {
    return await this.classroomService.markAsComplete(
      req.user.userId,
      classroomContentId,
    );
  }

  // ==================== READING PREFERENCES ====================

  /**
   * Get user reading preferences
   */
  @Get('preferences')
  async getPreferences(@Request() req) {
    return await this.classroomService.getOrCreatePreferences(req.user.userId);
  }

  /**
   * Update user reading preferences
   */
  @Patch('preferences')
  async updatePreferences(
    @Request() req,
    @Body() dto: UpdateReadingPreferencesDto,
  ) {
    return await this.classroomService.updatePreferences(req.user.userId, dto);
  }

  // ==================== MICRO QUIZ ====================

  /**
   * Get micro quiz for a sub-concept (without answers)
   */
  @Get('quiz/micro/:subConceptId')
  async getMicroQuiz(@Param('subConceptId') subConceptId: string) {
    const quiz = await this.classroomService.findQuizBySubConcept(subConceptId);
    if (!quiz) {
      return null;
    }

    // Return quiz without correct answers
    return {
      id: quiz.id,
      subConceptId: quiz.subConceptId,
      passingScore: quiz.passingScore,
      status: quiz.status,
      questions: quiz.questions.map(q => ({
        id: q.id,
        order: q.order,
        type: q.type,
        question: q.question,
        options: q.options,
        // Omit correctAnswer and explanation
      })),
    };
  }

  /**
   * Submit micro quiz answers
   */
  @Post('quiz/micro/:microQuizId/submit')
  async submitMicroQuiz(
    @Request() req,
    @Param('microQuizId') microQuizId: string,
    @Body() dto: SubmitMicroQuizDto,
  ) {
    const attempt = await this.classroomService.submitQuiz(
      req.user.userId,
      microQuizId,
      dto,
    );

    // Get the quiz to include explanations in response
    const quiz = await this.classroomService.findQuizBySubConcept(attempt.microQuizId);

    return {
      score: attempt.score,
      passed: attempt.passed,
      results: attempt.results.map(r => {
        const question = quiz?.questions.find(q => q.id === r.questionId);
        return {
          ...r,
          explanation: question?.explanation || '',
        };
      }),
    };
  }

  /**
   * Get quiz attempt history
   */
  @Get('quiz/micro/:microQuizId/attempts')
  async getQuizAttempts(
    @Request() req,
    @Param('microQuizId') microQuizId: string,
  ) {
    return await this.classroomService.getQuizAttempts(req.user.userId, microQuizId);
  }
}
