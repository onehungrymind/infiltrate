import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { CreateProjectDto } from './dto/create-project.dto';
import { LinkConceptDto, UpdateProjectConceptDto } from './dto/link-concept.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  @Get()
  findAll(
    @Query('pathId') pathId?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.projectsService.findAll({
      pathId,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    });
  }

  @Get('path/:pathId')
  findByPath(@Param('pathId') pathId: string) {
    return this.projectsService.findByPath(pathId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(id, updateProjectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }

  // Project-Concept linking endpoints

  @Post(':id/concepts')
  linkConcept(@Param('id') id: string, @Body() linkConceptDto: LinkConceptDto) {
    return this.projectsService.linkConcept(id, linkConceptDto);
  }

  @Get(':id/concepts')
  getProjectConcepts(@Param('id') id: string) {
    return this.projectsService.getProjectConcepts(id);
  }

  @Patch(':id/concepts/:conceptId')
  updateProjectConcept(
    @Param('id') id: string,
    @Param('conceptId') conceptId: string,
    @Body() updateDto: UpdateProjectConceptDto,
  ) {
    return this.projectsService.updateProjectConcept(id, conceptId, updateDto);
  }

  @Delete(':id/concepts/:conceptId')
  unlinkConcept(@Param('id') id: string, @Param('conceptId') conceptId: string) {
    return this.projectsService.unlinkConcept(id, conceptId);
  }
}
