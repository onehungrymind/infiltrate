import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateLearningPathDto } from './dto/create-learning-path.dto';
import { UpdateLearningPathDto } from './dto/update-learning-path.dto';
import { LearningPath } from './entities/learning-path.entity';

@Injectable()
export class LearningPathsService {
  constructor(
    @InjectRepository(LearningPath)
    private readonly learningPathRepository: Repository<LearningPath>,
  ) {}

  async create(createLearningPathDto: CreateLearningPathDto): Promise<LearningPath> {
    const learningPath = this.learningPathRepository.create({
      ...createLearningPathDto,
      status: (createLearningPathDto.status as LearningPath['status']) || 'not-started',
      visibility: createLearningPathDto.visibility || 'private',
    });
    return await this.learningPathRepository.save(learningPath);
  }

  async findAll(): Promise<LearningPath[]> {
    return await this.learningPathRepository.find();
  }

  async findOne(id: string): Promise<LearningPath> {
    const learningPath = await this.learningPathRepository.findOne({ where: { id } });
    if (!learningPath) {
      throw new NotFoundException(`Learning path with ID ${id} not found`);
    }
    return learningPath;
  }

  async update(id: string, updateLearningPathDto: UpdateLearningPathDto): Promise<LearningPath> {
    const learningPath = await this.findOne(id);
    Object.assign(learningPath, updateLearningPathDto);
    return await this.learningPathRepository.save(learningPath);
  }

  async remove(id: string): Promise<void> {
    const learningPath = await this.findOne(id);
    await this.learningPathRepository.remove(learningPath);
  }

  async assignMentor(pathId: string, mentorId: string): Promise<LearningPath> {
    const learningPath = await this.findOne(pathId);
    learningPath.mentorId = mentorId;
    return await this.learningPathRepository.save(learningPath);
  }

  async findByMentor(mentorId: string): Promise<LearningPath[]> {
    return await this.learningPathRepository.find({
      where: { mentorId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByCreator(creatorId: string): Promise<LearningPath[]> {
    return await this.learningPathRepository.find({
      where: { creatorId },
      order: { createdAt: 'DESC' },
    });
  }

  async findPublicPaths(): Promise<LearningPath[]> {
    return await this.learningPathRepository.find({
      where: { visibility: 'public' },
      order: { createdAt: 'DESC' },
    });
  }

  async findSharedPaths(): Promise<LearningPath[]> {
    return await this.learningPathRepository.find({
      where: [
        { visibility: 'public' },
        { visibility: 'shared' },
      ],
      order: { createdAt: 'DESC' },
    });
  }
}
