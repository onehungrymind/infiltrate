import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Enrollment } from './entities/enrollment.entity';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private enrollmentsRepository: Repository<Enrollment>,
  ) {}

  async enroll(createEnrollmentDto: CreateEnrollmentDto): Promise<Enrollment> {
    // Check if already enrolled
    const existing = await this.enrollmentsRepository.findOne({
      where: {
        userId: createEnrollmentDto.userId,
        pathId: createEnrollmentDto.pathId,
      },
    });

    if (existing) {
      // If previously dropped, reactivate
      if (existing.status === 'dropped') {
        existing.status = 'active';
        existing.enrolledAt = new Date();
        existing.completedAt = null as unknown as Date;
        if (createEnrollmentDto.mentorId !== undefined) {
          existing.mentorId = createEnrollmentDto.mentorId || (null as unknown as string);
        }
        return this.enrollmentsRepository.save(existing);
      }
      throw new ConflictException('User is already enrolled in this path');
    }

    const enrollment = this.enrollmentsRepository.create({
      ...createEnrollmentDto,
      status: createEnrollmentDto.status || 'active',
      enrolledAt: new Date(),
      mentorId: createEnrollmentDto.mentorId || (null as unknown as string),
    });

    return this.enrollmentsRepository.save(enrollment);
  }

  async findByUser(userId: string): Promise<Enrollment[]> {
    return this.enrollmentsRepository.find({
      where: { userId },
      relations: ['learningPath', 'mentor'],
      order: { enrolledAt: 'DESC' },
    });
  }

  async findByPath(pathId: string): Promise<Enrollment[]> {
    return this.enrollmentsRepository.find({
      where: { pathId },
      relations: ['user'],
      order: { enrolledAt: 'DESC' },
    });
  }

  async findActiveByPath(pathId: string): Promise<Enrollment[]> {
    return this.enrollmentsRepository.find({
      where: { pathId, status: 'active' },
      relations: ['user'],
      order: { enrolledAt: 'DESC' },
    });
  }

  async isEnrolled(userId: string, pathId: string): Promise<boolean> {
    const enrollment = await this.enrollmentsRepository.findOne({
      where: { userId, pathId, status: 'active' },
    });
    return !!enrollment;
  }

  async getEnrollment(userId: string, pathId: string): Promise<Enrollment | null> {
    return this.enrollmentsRepository.findOne({
      where: { userId, pathId },
      relations: ['learningPath', 'user'],
    });
  }

  async unenroll(userId: string, pathId: string): Promise<Enrollment> {
    const enrollment = await this.enrollmentsRepository.findOne({
      where: { userId, pathId },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    enrollment.status = 'dropped';
    return this.enrollmentsRepository.save(enrollment);
  }

  async update(
    userId: string,
    pathId: string,
    updateEnrollmentDto: UpdateEnrollmentDto,
  ): Promise<Enrollment> {
    const enrollment = await this.enrollmentsRepository.findOne({
      where: { userId, pathId },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    if (updateEnrollmentDto.status) {
      enrollment.status = updateEnrollmentDto.status;
    }

    if (updateEnrollmentDto.status === 'completed') {
      enrollment.completedAt = new Date();
    }

    if (updateEnrollmentDto.completedAt) {
      enrollment.completedAt = new Date(updateEnrollmentDto.completedAt);
    }

    // Handle mentor assignment - allow setting to null or a new value
    if (updateEnrollmentDto.mentorId !== undefined) {
      enrollment.mentorId = updateEnrollmentDto.mentorId || (null as unknown as string);
    }

    return this.enrollmentsRepository.save(enrollment);
  }

  async getPathLeaderboard(pathId: string): Promise<any[]> {
    // Get all active enrollees with their progress stats
    const enrollments = await this.enrollmentsRepository.find({
      where: { pathId, status: 'active' },
      relations: ['user'],
    });

    // For now, return basic leaderboard data
    // In the future, this can be enhanced to include progress percentages,
    // completed units, etc. from the user_progress table
    return enrollments.map((enrollment) => ({
      userId: enrollment.userId,
      userName: enrollment.user?.name || 'Unknown',
      enrolledAt: enrollment.enrolledAt,
      status: enrollment.status,
    }));
  }

  async findAll(): Promise<Enrollment[]> {
    return this.enrollmentsRepository.find({
      relations: ['user', 'learningPath', 'mentor'],
    });
  }

  async delete(userId: string, pathId: string): Promise<void> {
    const result = await this.enrollmentsRepository.delete({ userId, pathId });
    if (result.affected === 0) {
      throw new NotFoundException('Enrollment not found');
    }
  }
}
