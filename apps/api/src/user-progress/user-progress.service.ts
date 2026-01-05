import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserProgressDto } from './dto/create-user-progress.dto';
import { UpdateUserProgressDto } from './dto/update-user-progress.dto';
import { UserProgress } from './entities/user-progress.entity';

@Injectable()
export class UserProgressService {
  constructor(
    @InjectRepository(UserProgress)
    private readonly userProgressRepository: Repository<UserProgress>,
  ) {}

  async create(createUserProgressDto: CreateUserProgressDto): Promise<UserProgress> {
    const userProgress = this.userProgressRepository.create({
      ...createUserProgressDto,
      masteryLevel: createUserProgressDto.masteryLevel || 'learning',
      confidence: createUserProgressDto.confidence || 0,
      easinessFactor: createUserProgressDto.easinessFactor || 2.5,
      interval: createUserProgressDto.interval || 1,
      repetitions: createUserProgressDto.repetitions || 0,
      nextReviewDate: createUserProgressDto.nextReviewDate 
        ? new Date(createUserProgressDto.nextReviewDate) 
        : new Date(),
      attempts: 0,
    });
    return await this.userProgressRepository.save(userProgress);
  }

  async findAll(): Promise<UserProgress[]> {
    return await this.userProgressRepository.find();
  }

  async findOne(id: string): Promise<UserProgress> {
    const userProgress = await this.userProgressRepository.findOne({ where: { id } });
    if (!userProgress) {
      throw new NotFoundException(`User progress with ID ${id} not found`);
    }
    return userProgress;
  }

  async update(id: string, updateUserProgressDto: UpdateUserProgressDto): Promise<UserProgress> {
    const userProgress = await this.findOne(id);
    Object.assign(userProgress, updateUserProgressDto);
    if (updateUserProgressDto.nextReviewDate) {
      userProgress.nextReviewDate = new Date(updateUserProgressDto.nextReviewDate);
    }
    return await this.userProgressRepository.save(userProgress);
  }

  async remove(id: string): Promise<void> {
    const userProgress = await this.findOne(id);
    await this.userProgressRepository.remove(userProgress);
  }
}
