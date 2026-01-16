import { Body, Controller, Delete,Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse,ApiTags } from '@nestjs/swagger';

import { CreateLearningPathDto } from './dto/create-learning-path.dto';
import { UpdateLearningPathDto } from './dto/update-learning-path.dto';
import { LearningPathsService } from './learning-paths.service';

@ApiTags('learning-paths')
@Controller('learning-paths')
export class LearningPathsController {
  constructor(private readonly learningPathsService: LearningPathsService) {}

  @Post()
  create(@Body() createLearningPathDto: CreateLearningPathDto) {
    return this.learningPathsService.create(createLearningPathDto);
  }

  @Get()
  findAll() {
    return this.learningPathsService.findAll();
  }

  @Get('mentor/:mentorId')
  @ApiOperation({ summary: 'Get all learning paths assigned to a mentor' })
  @ApiResponse({ status: 200, description: 'List of learning paths for the mentor' })
  findByMentor(@Param('mentorId') mentorId: string) {
    return this.learningPathsService.findByMentor(mentorId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.learningPathsService.findOne(id);
  }

  @Patch(':id/mentor')
  @ApiOperation({ summary: 'Assign or update mentor for a learning path' })
  @ApiResponse({ status: 200, description: 'Mentor assigned successfully' })
  assignMentor(
    @Param('id') id: string,
    @Body('mentorId') mentorId: string,
  ) {
    return this.learningPathsService.assignMentor(id, mentorId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLearningPathDto: UpdateLearningPathDto) {
    return this.learningPathsService.update(id, updateLearningPathDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.learningPathsService.remove(id);
  }
}
