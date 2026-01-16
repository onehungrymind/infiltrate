import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateChallengeDto } from './dto/create-challenge.dto';
import { UpdateChallengeDto } from './dto/update-challenge.dto';
import { Challenge } from './entities/challenge.entity';

@Injectable()
export class ChallengesService {
  constructor(
    @InjectRepository(Challenge)
    private readonly challengeRepository: Repository<Challenge>,
  ) {}

  async create(createChallengeDto: CreateChallengeDto): Promise<Challenge> {
    const challenge = this.challengeRepository.create({
      ...createChallengeDto,
      difficulty: createChallengeDto.difficulty || 'beginner',
      estimatedMinutes: createChallengeDto.estimatedMinutes || 30,
      rubricCriteria: createChallengeDto.rubricCriteria || [],
      successCriteria: createChallengeDto.successCriteria || [],
      contentTypes: createChallengeDto.contentTypes || ['code'],
      isActive: createChallengeDto.isActive ?? true,
    });
    return await this.challengeRepository.save(challenge);
  }

  async findAll(options?: { unitId?: string; isActive?: boolean }): Promise<Challenge[]> {
    const where: any = {};

    if (options?.unitId) {
      where.unitId = options.unitId;
    }

    if (options?.isActive !== undefined) {
      where.isActive = options.isActive;
    }

    return await this.challengeRepository.find({ where });
  }

  async findOne(id: string): Promise<Challenge> {
    const challenge = await this.challengeRepository.findOne({
      where: { id },
      relations: ['knowledgeUnit'],
    });
    if (!challenge) {
      throw new NotFoundException(`Challenge with ID ${id} not found`);
    }
    return challenge;
  }

  async findByUnit(unitId: string): Promise<Challenge[]> {
    return await this.challengeRepository.find({
      where: { unitId },
      order: { createdAt: 'ASC' },
    });
  }

  async update(id: string, updateChallengeDto: UpdateChallengeDto): Promise<Challenge> {
    const challenge = await this.findOne(id);
    Object.assign(challenge, updateChallengeDto);
    return await this.challengeRepository.save(challenge);
  }

  async remove(id: string): Promise<void> {
    const challenge = await this.findOne(id);
    await this.challengeRepository.remove(challenge);
  }
}
