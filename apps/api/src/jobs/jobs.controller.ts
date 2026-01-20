import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
} from '@nestjs/common';

import { CreateBuildJobDto } from './dto/create-build-job.dto';
import { BuildJob } from './entities/build-job.entity';
import { JobsService } from './jobs.service';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post('build')
  async createBuildJob(@Body() dto: CreateBuildJobDto): Promise<BuildJob> {
    return this.jobsService.createBuildJob(dto);
  }

  @Get()
  async findAll(): Promise<BuildJob[]> {
    return this.jobsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<BuildJob> {
    return this.jobsService.findOne(id);
  }

  @Get(':id/progress')
  async getProgress(@Param('id') id: string) {
    return this.jobsService.getJobProgress(id);
  }

  @Get('path/:pathId')
  async findByPath(@Param('pathId') pathId: string): Promise<BuildJob[]> {
    return this.jobsService.findByPath(pathId);
  }

  @Get('path/:pathId/active')
  async getActiveJob(@Param('pathId') pathId: string): Promise<BuildJob | null> {
    return this.jobsService.getActiveJob(pathId);
  }

  @Delete(':id')
  async cancelJob(@Param('id') id: string): Promise<BuildJob> {
    return this.jobsService.cancelJob(id);
  }
}
