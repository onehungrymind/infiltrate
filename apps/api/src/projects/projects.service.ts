import { ConflictException,Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateProjectDto } from './dto/create-project.dto';
import { LinkConceptDto, UpdateProjectConceptDto } from './dto/link-concept.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';
import { ProjectConcept } from './entities/project-concept.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(ProjectConcept)
    private readonly projectConceptRepository: Repository<ProjectConcept>,
  ) {}

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    const project = this.projectRepository.create({
      ...createProjectDto,
      objectives: createProjectDto.objectives || [],
      requirements: createProjectDto.requirements || [],
      estimatedHours: createProjectDto.estimatedHours || 10,
      difficulty: createProjectDto.difficulty || 'intermediate',
      isActive: createProjectDto.isActive ?? true,
    });
    return await this.projectRepository.save(project);
  }

  async findAll(options?: { pathId?: string; isActive?: boolean }): Promise<Project[]> {
    const where: any = {};

    if (options?.pathId) {
      where.pathId = options.pathId;
    }

    if (options?.isActive !== undefined) {
      where.isActive = options.isActive;
    }

    return await this.projectRepository.find({
      where,
      relations: ['projectConcepts', 'projectConcepts.concept'],
    });
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['learningPath', 'projectConcepts', 'projectConcepts.concept'],
    });
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return project;
  }

  async findByPath(pathId: string): Promise<Project[]> {
    return await this.projectRepository.find({
      where: { pathId },
      relations: ['projectConcepts', 'projectConcepts.concept'],
      order: { createdAt: 'ASC' },
    });
  }

  async update(id: string, updateProjectDto: UpdateProjectDto): Promise<Project> {
    const project = await this.findOne(id);
    Object.assign(project, updateProjectDto);
    return await this.projectRepository.save(project);
  }

  async remove(id: string): Promise<void> {
    const project = await this.findOne(id);
    await this.projectRepository.remove(project);
  }

  // ProjectConcept methods

  async linkConcept(projectId: string, linkConceptDto: LinkConceptDto): Promise<ProjectConcept> {
    // Verify project exists
    await this.findOne(projectId);

    // Check if link already exists
    const existingLink = await this.projectConceptRepository.findOne({
      where: {
        projectId,
        conceptId: linkConceptDto.conceptId,
      },
    });

    if (existingLink) {
      throw new ConflictException(
        `Concept ${linkConceptDto.conceptId} is already linked to project ${projectId}`,
      );
    }

    const projectConcept = this.projectConceptRepository.create({
      projectId,
      conceptId: linkConceptDto.conceptId,
      weight: linkConceptDto.weight,
      rubricCriteria: linkConceptDto.rubricCriteria || [],
    });

    return await this.projectConceptRepository.save(projectConcept);
  }

  async updateProjectConcept(
    projectId: string,
    conceptId: string,
    updateDto: UpdateProjectConceptDto,
  ): Promise<ProjectConcept> {
    const projectConcept = await this.projectConceptRepository.findOne({
      where: { projectId, conceptId },
    });

    if (!projectConcept) {
      throw new NotFoundException(
        `Link between project ${projectId} and concept ${conceptId} not found`,
      );
    }

    Object.assign(projectConcept, updateDto);
    return await this.projectConceptRepository.save(projectConcept);
  }

  async unlinkConcept(projectId: string, conceptId: string): Promise<void> {
    const projectConcept = await this.projectConceptRepository.findOne({
      where: { projectId, conceptId },
    });

    if (!projectConcept) {
      throw new NotFoundException(
        `Link between project ${projectId} and concept ${conceptId} not found`,
      );
    }

    await this.projectConceptRepository.remove(projectConcept);
  }

  async getProjectConcepts(projectId: string): Promise<ProjectConcept[]> {
    return await this.projectConceptRepository.find({
      where: { projectId },
      relations: ['concept'],
    });
  }
}
