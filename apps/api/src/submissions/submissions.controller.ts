import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody,ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CreateMentorFeedbackDto } from './dto/create-mentor-feedback.dto';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { RequestFeedbackDto } from './dto/request-feedback.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { SubmissionsService } from './submissions.service';
import { buildFileMetadata,multerConfig } from './utils/file-upload';
import { fetchUrlMetadata, isValidUrl } from './utils/url-metadata';

@ApiTags('submissions')
@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new submission' })
  @ApiResponse({ status: 201, description: 'Submission created successfully' })
  create(@Body() createSubmissionDto: CreateSubmissionDto) {
    return this.submissionsService.create(createSubmissionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all submissions' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiQuery({ name: 'pathId', required: false, description: 'Filter by learning path' })
  @ApiResponse({ status: 200, description: 'List of submissions' })
  findAll(
    @Query('status') status?: string,
    @Query('pathId') pathId?: string,
  ) {
    if (status) {
      return this.submissionsService.findByStatus(status);
    }
    if (pathId) {
      return this.submissionsService.findByPath(pathId);
    }
    return this.submissionsService.findAll();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all submissions for a specific user' })
  @ApiResponse({ status: 200, description: 'List of submissions for the user' })
  findByUser(@Param('userId') userId: string) {
    return this.submissionsService.findByUser(userId);
  }

  @Get('mentor/:mentorId')
  @ApiOperation({ summary: 'Get all submissions for paths assigned to a mentor' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by submission status' })
  @ApiResponse({ status: 200, description: 'List of submissions for mentor review' })
  findByMentor(
    @Param('mentorId') mentorId: string,
    @Query('status') status?: string,
  ) {
    return this.submissionsService.findByMentor(mentorId, status);
  }

  @Get('unit/:unitId')
  @ApiOperation({ summary: 'Get all submissions for a specific knowledge unit' })
  @ApiResponse({ status: 200, description: 'List of submissions for the unit' })
  findByUnit(@Param('unitId') unitId: string) {
    return this.submissionsService.findByUnit(unitId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific submission by ID' })
  @ApiResponse({ status: 200, description: 'The submission with feedback' })
  @ApiResponse({ status: 404, description: 'Submission not found' })
  findOne(@Param('id') id: string) {
    return this.submissionsService.findOne(id);
  }

  @Post(':id/submit')
  @ApiOperation({
    summary: 'Submit for review',
    description: 'Changes submission status from draft to submitted',
  })
  @ApiResponse({ status: 200, description: 'Submission submitted for review' })
  @ApiResponse({ status: 400, description: 'Submission is not in draft status' })
  @ApiResponse({ status: 404, description: 'Submission not found' })
  submit(@Param('id') id: string) {
    return this.submissionsService.submit(id);
  }

  @Post(':id/feedback/ai')
  @ApiOperation({
    summary: 'Request AI feedback',
    description: 'Generates AI-powered feedback using Claude. Submission must be submitted first.',
  })
  @ApiResponse({ status: 201, description: 'AI feedback generated successfully' })
  @ApiResponse({ status: 400, description: 'Cannot request feedback on draft or AI not configured' })
  @ApiResponse({ status: 404, description: 'Submission not found' })
  requestAiFeedback(
    @Param('id') id: string,
    @Body() requestFeedbackDto: RequestFeedbackDto,
  ) {
    return this.submissionsService.requestAiFeedback(id, requestFeedbackDto);
  }

  @Post(':id/feedback/mentor')
  @ApiOperation({
    summary: 'Submit mentor feedback',
    description: 'Creates mentor feedback for a submission. For projects, grade is required.',
  })
  @ApiResponse({ status: 201, description: 'Mentor feedback created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid feedback data or missing grade for project' })
  @ApiResponse({ status: 403, description: 'User is not the assigned mentor' })
  @ApiResponse({ status: 404, description: 'Submission not found' })
  submitMentorFeedback(
    @Param('id') id: string,
    @Body() createMentorFeedbackDto: CreateMentorFeedbackDto,
    @Query('mentorId') mentorId: string,
  ) {
    return this.submissionsService.submitMentorFeedback(id, mentorId, createMentorFeedbackDto);
  }

  @Get(':id/feedback')
  @ApiOperation({ summary: 'Get all feedback for a submission' })
  @ApiResponse({ status: 200, description: 'List of feedback for the submission' })
  getFeedback(@Param('id') id: string) {
    return this.submissionsService.getFeedback(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a submission' })
  @ApiResponse({ status: 200, description: 'Submission updated successfully' })
  @ApiResponse({ status: 404, description: 'Submission not found' })
  update(
    @Param('id') id: string,
    @Body() updateSubmissionDto: UpdateSubmissionDto,
  ) {
    return this.submissionsService.update(id, updateSubmissionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a submission' })
  @ApiResponse({ status: 200, description: 'Submission deleted successfully' })
  @ApiResponse({ status: 404, description: 'Submission not found' })
  remove(@Param('id') id: string) {
    return this.submissionsService.remove(id);
  }

  // File Upload endpoint
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  @ApiOperation({ summary: 'Upload a file for submission' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        userId: { type: 'string' },
        challengeId: { type: 'string' },
        projectId: { type: 'string' },
        pathId: { type: 'string' },
        title: { type: 'string' },
      },
      required: ['file', 'userId', 'title'],
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file type or size' })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('userId') userId: string,
    @Body('challengeId') challengeId?: string,
    @Body('projectId') projectId?: string,
    @Body('pathId') pathId?: string,
    @Body('title') title?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const fileMetadata = buildFileMetadata(file);

    return this.submissionsService.create({
      userId,
      challengeId,
      projectId,
      pathId,
      title: title || file.originalname,
      contentType: 'file',
      content: fileMetadata.storagePath,
      fileMetadata,
    });
  }

  // URL Metadata endpoint
  @Post('url-metadata')
  @ApiOperation({ summary: 'Fetch metadata for a URL' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string' },
      },
      required: ['url'],
    },
  })
  @ApiResponse({ status: 200, description: 'URL metadata fetched successfully' })
  @ApiResponse({ status: 400, description: 'Invalid URL' })
  async getUrlMetadata(@Body('url') url: string) {
    if (!url || !isValidUrl(url)) {
      throw new BadRequestException('Invalid URL provided');
    }

    return fetchUrlMetadata(url);
  }

  // Challenge-specific submissions
  @Get('challenge/:challengeId')
  @ApiOperation({ summary: 'Get all submissions for a specific challenge' })
  @ApiResponse({ status: 200, description: 'List of submissions for the challenge' })
  findByChallenge(@Param('challengeId') challengeId: string) {
    return this.submissionsService.findByChallenge(challengeId);
  }

  // Project-specific submissions
  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get all submissions for a specific project' })
  @ApiResponse({ status: 200, description: 'List of submissions for the project' })
  findByProject(@Param('projectId') projectId: string) {
    return this.submissionsService.findByProject(projectId);
  }
}
