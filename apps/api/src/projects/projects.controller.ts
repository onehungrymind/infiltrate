import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { LinkPrincipleDto, UpdateProjectPrincipleDto } from './dto/link-principle.dto';

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

  // Project-Principle linking endpoints

  @Post(':id/principles')
  linkPrinciple(@Param('id') id: string, @Body() linkPrincipleDto: LinkPrincipleDto) {
    return this.projectsService.linkPrinciple(id, linkPrincipleDto);
  }

  @Get(':id/principles')
  getProjectPrinciples(@Param('id') id: string) {
    return this.projectsService.getProjectPrinciples(id);
  }

  @Patch(':id/principles/:principleId')
  updateProjectPrinciple(
    @Param('id') id: string,
    @Param('principleId') principleId: string,
    @Body() updateDto: UpdateProjectPrincipleDto,
  ) {
    return this.projectsService.updateProjectPrinciple(id, principleId, updateDto);
  }

  @Delete(':id/principles/:principleId')
  unlinkPrinciple(@Param('id') id: string, @Param('principleId') principleId: string) {
    return this.projectsService.unlinkPrinciple(id, principleId);
  }
}
