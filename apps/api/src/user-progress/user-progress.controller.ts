import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery,ApiResponse, ApiTags } from '@nestjs/swagger';

import { CreateUserProgressDto } from './dto/create-user-progress.dto';
import { RecordAttemptDto } from './dto/record-attempt.dto';
import { UpdateUserProgressDto } from './dto/update-user-progress.dto';
import { UserProgressService } from './user-progress.service';

@ApiTags('user-progress')
@Controller('user-progress')
export class UserProgressController {
  constructor(private readonly userProgressService: UserProgressService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user progress record' })
  @ApiResponse({ status: 201, description: 'Progress record created successfully' })
  create(@Body() createUserProgressDto: CreateUserProgressDto) {
    return this.userProgressService.create(createUserProgressDto);
  }

  @Post('record-attempt')
  @ApiOperation({
    summary: 'Record a study attempt using SM-2 algorithm',
    description: 'Records a flashcard/quiz attempt and updates spaced repetition scheduling. Quality scale: 0=blackout, 1-2=incorrect, 3=hard, 4=good, 5=easy',
  })
  @ApiResponse({ status: 201, description: 'Attempt recorded and progress updated' })
  recordAttempt(@Body() recordAttemptDto: RecordAttemptDto) {
    return this.userProgressService.recordAttempt(recordAttemptDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user progress records' })
  findAll() {
    return this.userProgressService.findAll();
  }

  @Get('due-for-review')
  @ApiOperation({
    summary: 'Get knowledge units due for review',
    description: 'Returns all progress records where nextReviewDate is in the past',
  })
  @ApiQuery({ name: 'userId', required: true, description: 'The user ID to get due reviews for' })
  @ApiResponse({ status: 200, description: 'List of progress records due for review' })
  findDueForReview(@Query('userId') userId: string) {
    return this.userProgressService.findDueForReview(userId);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get study statistics for a user',
    description: 'Returns aggregated stats: total units, due for review, mastered, learning, reviewing, average confidence',
  })
  @ApiQuery({ name: 'userId', required: true, description: 'The user ID to get stats for' })
  @ApiResponse({ status: 200, description: 'Study statistics for the user' })
  getStudyStats(@Query('userId') userId: string) {
    return this.userProgressService.getStudyStats(userId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all progress records for a specific user' })
  @ApiResponse({ status: 200, description: 'List of progress records for the user' })
  findByUser(@Param('userId') userId: string) {
    return this.userProgressService.findByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific user progress record by ID' })
  @ApiResponse({ status: 200, description: 'The progress record' })
  @ApiResponse({ status: 404, description: 'Progress record not found' })
  findOne(@Param('id') id: string) {
    return this.userProgressService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user progress record' })
  @ApiResponse({ status: 200, description: 'Progress record updated successfully' })
  @ApiResponse({ status: 404, description: 'Progress record not found' })
  update(@Param('id') id: string, @Body() updateUserProgressDto: UpdateUserProgressDto) {
    return this.userProgressService.update(id, updateUserProgressDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user progress record' })
  @ApiResponse({ status: 200, description: 'Progress record deleted successfully' })
  @ApiResponse({ status: 404, description: 'Progress record not found' })
  remove(@Param('id') id: string) {
    return this.userProgressService.remove(id);
  }
}
