import { ConflictException,Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateProjectDto } from './dto/create-project.dto';
import { LinkPrincipleDto, UpdateProjectPrincipleDto } from './dto/link-principle.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';
import { ProjectPrinciple } from './entities/project-principle.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(ProjectPrinciple)
    private readonly projectPrincipleRepository: Repository<ProjectPrinciple>,
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
      relations: ['projectPrinciples', 'projectPrinciples.principle'],
    });
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['learningPath', 'projectPrinciples', 'projectPrinciples.principle'],
    });
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return project;
  }

  async findByPath(pathId: string): Promise<Project[]> {
    return await this.projectRepository.find({
      where: { pathId },
      relations: ['projectPrinciples', 'projectPrinciples.principle'],
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

  // ProjectPrinciple methods

  async linkPrinciple(projectId: string, linkPrincipleDto: LinkPrincipleDto): Promise<ProjectPrinciple> {
    // Verify project exists
    await this.findOne(projectId);

    // Check if link already exists
    const existingLink = await this.projectPrincipleRepository.findOne({
      where: {
        projectId,
        principleId: linkPrincipleDto.principleId,
      },
    });

    if (existingLink) {
      throw new ConflictException(
        `Principle ${linkPrincipleDto.principleId} is already linked to project ${projectId}`,
      );
    }

    const projectPrinciple = this.projectPrincipleRepository.create({
      projectId,
      principleId: linkPrincipleDto.principleId,
      weight: linkPrincipleDto.weight,
      rubricCriteria: linkPrincipleDto.rubricCriteria || [],
    });

    return await this.projectPrincipleRepository.save(projectPrinciple);
  }

  async updateProjectPrinciple(
    projectId: string,
    principleId: string,
    updateDto: UpdateProjectPrincipleDto,
  ): Promise<ProjectPrinciple> {
    const projectPrinciple = await this.projectPrincipleRepository.findOne({
      where: { projectId, principleId },
    });

    if (!projectPrinciple) {
      throw new NotFoundException(
        `Link between project ${projectId} and principle ${principleId} not found`,
      );
    }

    Object.assign(projectPrinciple, updateDto);
    return await this.projectPrincipleRepository.save(projectPrinciple);
  }

  async unlinkPrinciple(projectId: string, principleId: string): Promise<void> {
    const projectPrinciple = await this.projectPrincipleRepository.findOne({
      where: { projectId, principleId },
    });

    if (!projectPrinciple) {
      throw new NotFoundException(
        `Link between project ${projectId} and principle ${principleId} not found`,
      );
    }

    await this.projectPrincipleRepository.remove(projectPrinciple);
  }

  async getProjectPrinciples(projectId: string): Promise<ProjectPrinciple[]> {
    return await this.projectPrincipleRepository.find({
      where: { projectId },
      relations: ['principle'],
    });
  }
}
