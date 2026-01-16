import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual,Repository } from 'typeorm';

import { CreateUserProgressDto } from './dto/create-user-progress.dto';
import { RecordAttemptDto } from './dto/record-attempt.dto';
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

  async findByUserAndUnit(userId: string, unitId: string): Promise<UserProgress | null> {
    return await this.userProgressRepository.findOne({
      where: { userId, unitId },
    });
  }

  async findByUser(userId: string): Promise<UserProgress[]> {
    return await this.userProgressRepository.find({
      where: { userId },
    });
  }

  async findDueForReview(userId: string): Promise<UserProgress[]> {
    const now = new Date();
    return await this.userProgressRepository.find({
      where: {
        userId,
        nextReviewDate: LessThanOrEqual(now),
      },
      order: {
        nextReviewDate: 'ASC',
      },
    });
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

  /**
   * SM-2 Algorithm Implementation
   *
   * Records a study attempt and calculates the next review date using the SM-2 algorithm.
   *
   * Quality scale (0-5):
   * - 0: Complete blackout, no recall
   * - 1: Incorrect, but correct answer remembered after seeing it
   * - 2: Incorrect, but correct answer seemed easy to recall
   * - 3: Correct response with serious difficulty
   * - 4: Correct response after hesitation
   * - 5: Perfect response with no hesitation
   *
   * @param recordAttemptDto - Contains userId, unitId, and quality rating
   * @returns Updated UserProgress with new SM-2 values
   */
  async recordAttempt(recordAttemptDto: RecordAttemptDto): Promise<UserProgress> {
    const { userId, unitId, quality } = recordAttemptDto;

    // Find existing progress or create new one
    let progress = await this.findByUserAndUnit(userId, unitId);

    if (!progress) {
      progress = this.userProgressRepository.create({
        userId,
        unitId,
        masteryLevel: 'learning',
        confidence: 0,
        easinessFactor: 2.5,
        interval: 1,
        repetitions: 0,
        nextReviewDate: new Date(),
        attempts: 0,
      });
    }

    // Apply SM-2 algorithm
    const sm2Result = this.calculateSM2(
      quality,
      progress.repetitions,
      progress.easinessFactor,
      progress.interval,
    );

    // Update progress with SM-2 results
    progress.easinessFactor = sm2Result.easinessFactor;
    progress.interval = sm2Result.interval;
    progress.repetitions = sm2Result.repetitions;
    progress.nextReviewDate = sm2Result.nextReviewDate;
    progress.attempts += 1;
    progress.lastAttemptAt = new Date();

    // Update mastery level based on repetitions and quality
    progress.masteryLevel = this.calculateMasteryLevel(
      sm2Result.repetitions,
      quality,
      progress.attempts,
    );

    // Update confidence based on recent performance
    progress.confidence = this.calculateConfidence(
      quality,
      progress.confidence,
      progress.attempts,
    );

    return await this.userProgressRepository.save(progress);
  }

  /**
   * Core SM-2 calculation
   *
   * Formula:
   * EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
   * EF must be >= 1.3
   *
   * Interval calculation:
   * - If quality < 3: Reset to 1 day, repetitions = 0
   * - If repetitions = 0: interval = 1
   * - If repetitions = 1: interval = 6
   * - Otherwise: interval = previous interval * EF
   */
  private calculateSM2(
    quality: number,
    repetitions: number,
    easinessFactor: number,
    previousInterval: number,
  ): {
    easinessFactor: number;
    interval: number;
    repetitions: number;
    nextReviewDate: Date;
  } {
    // Calculate new easiness factor
    let newEF = easinessFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

    // EF must be at least 1.3
    newEF = Math.max(1.3, newEF);

    // Round to 2 decimal places
    newEF = Math.round(newEF * 100) / 100;

    let newInterval: number;
    let newRepetitions: number;

    if (quality < 3) {
      // Incorrect response - reset
      newRepetitions = 0;
      newInterval = 1;
    } else {
      // Correct response
      newRepetitions = repetitions + 1;

      if (newRepetitions === 1) {
        newInterval = 1;
      } else if (newRepetitions === 2) {
        newInterval = 6;
      } else {
        newInterval = Math.round(previousInterval * newEF);
      }
    }

    // Calculate next review date
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

    return {
      easinessFactor: newEF,
      interval: newInterval,
      repetitions: newRepetitions,
      nextReviewDate,
    };
  }

  /**
   * Calculate mastery level based on performance
   */
  private calculateMasteryLevel(
    repetitions: number,
    quality: number,
    totalAttempts: number,
  ): string {
    // Mastered: 5+ successful repetitions with good quality
    if (repetitions >= 5 && quality >= 4) {
      return 'mastered';
    }

    // Reviewing: 2+ successful repetitions
    if (repetitions >= 2) {
      return 'reviewing';
    }

    // Still learning
    return 'learning';
  }

  /**
   * Calculate confidence score (0-100) using exponential moving average
   */
  private calculateConfidence(
    quality: number,
    currentConfidence: number,
    totalAttempts: number,
  ): number {
    // Convert quality (0-5) to percentage (0-100)
    const qualityPercent = (quality / 5) * 100;

    // Use exponential moving average with more weight on recent attempts
    const alpha = 0.3; // Weight for new value
    const newConfidence = alpha * qualityPercent + (1 - alpha) * currentConfidence;

    return Math.round(newConfidence);
  }

  /**
   * Get study statistics for a user
   */
  async getStudyStats(userId: string): Promise<{
    totalUnits: number;
    dueForReview: number;
    mastered: number;
    learning: number;
    reviewing: number;
    averageConfidence: number;
  }> {
    const allProgress = await this.findByUser(userId);
    const dueProgress = await this.findDueForReview(userId);

    const mastered = allProgress.filter(p => p.masteryLevel === 'mastered').length;
    const learning = allProgress.filter(p => p.masteryLevel === 'learning').length;
    const reviewing = allProgress.filter(p => p.masteryLevel === 'reviewing').length;

    const totalConfidence = allProgress.reduce((sum, p) => sum + p.confidence, 0);
    const averageConfidence = allProgress.length > 0
      ? Math.round(totalConfidence / allProgress.length)
      : 0;

    return {
      totalUnits: allProgress.length,
      dueForReview: dueProgress.length,
      mastered,
      learning,
      reviewing,
      averageConfidence,
    };
  }
}
