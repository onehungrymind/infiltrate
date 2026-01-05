import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LearningPathsService } from './learning-paths.service';
import { CreateLearningPathDto } from './dto/create-learning-path.dto';
import { UpdateLearningPathDto } from './dto/update-learning-path.dto';

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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.learningPathsService.findOne(id);
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
