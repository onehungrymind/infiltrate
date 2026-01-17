import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';

import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';

@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  enroll(@Body() createEnrollmentDto: CreateEnrollmentDto) {
    return this.enrollmentsService.enroll(createEnrollmentDto);
  }

  @Get()
  findAll() {
    return this.enrollmentsService.findAll();
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.enrollmentsService.findByUser(userId);
  }

  @Get('path/:pathId')
  findByPath(
    @Param('pathId') pathId: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    if (activeOnly === 'true') {
      return this.enrollmentsService.findActiveByPath(pathId);
    }
    return this.enrollmentsService.findByPath(pathId);
  }

  @Get('path/:pathId/leaderboard')
  getLeaderboard(@Param('pathId') pathId: string) {
    return this.enrollmentsService.getPathLeaderboard(pathId);
  }

  @Get('check/:userId/:pathId')
  async checkEnrollment(
    @Param('userId') userId: string,
    @Param('pathId') pathId: string,
  ) {
    const isEnrolled = await this.enrollmentsService.isEnrolled(userId, pathId);
    const enrollment = await this.enrollmentsService.getEnrollment(userId, pathId);
    return { isEnrolled, enrollment };
  }

  @Patch(':userId/:pathId')
  update(
    @Param('userId') userId: string,
    @Param('pathId') pathId: string,
    @Body() updateEnrollmentDto: UpdateEnrollmentDto,
  ) {
    return this.enrollmentsService.update(userId, pathId, updateEnrollmentDto);
  }

  @Delete(':userId/:pathId')
  unenroll(
    @Param('userId') userId: string,
    @Param('pathId') pathId: string,
  ) {
    return this.enrollmentsService.unenroll(userId, pathId);
  }
}
