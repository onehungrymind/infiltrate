import Anthropic from '@anthropic-ai/sdk';
import { BadRequestException, ForbiddenException,Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import {Repository } from 'typeorm';

import { KnowledgeUnit } from '../knowledge-units/entities/knowledge-unit.entity';
import { LearningPath } from '../learning-paths/entities/learning-path.entity';
import { CreateMentorFeedbackDto } from './dto/create-mentor-feedback.dto';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { RequestFeedbackDto } from './dto/request-feedback.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { Feedback, RubricScore } from './entities/feedback.entity';
import { Submission } from './entities/submission.entity';
import { DEFAULT_RUBRIC_CRITERIA,EVALUATE_SUBMISSION_PROMPT } from './prompts/evaluate-submission.prompt';

@Injectable()
export class SubmissionsService {
  private anthropic: Anthropic | null = null;

  constructor(
    @InjectRepository(Submission)
    private readonly submissionRepository: Repository<Submission>,
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
    @InjectRepository(KnowledgeUnit)
    private readonly knowledgeUnitRepository: Repository<KnowledgeUnit>,
    @InjectRepository(LearningPath)
    private readonly learningPathRepository: Repository<LearningPath>,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    if (apiKey) {
      this.anthropic = new Anthropic({ apiKey });
    }
  }

  // ==================== CRUD Operations ====================

  async create(createSubmissionDto: CreateSubmissionDto): Promise<Submission> {
    let pathId = createSubmissionDto.pathId;

    // If unitId is provided, verify it exists (for backward compatibility)
    if (createSubmissionDto.unitId) {
      const knowledgeUnit = await this.knowledgeUnitRepository.findOne({
        where: { id: createSubmissionDto.unitId },
      });
      if (!knowledgeUnit) {
        throw new NotFoundException(`Knowledge unit ${createSubmissionDto.unitId} not found`);
      }
      pathId = pathId || knowledgeUnit.pathId;
    }

    const submission = this.submissionRepository.create({
      ...createSubmissionDto,
      contentType: createSubmissionDto.contentType || 'text',
      status: 'draft',
      pathId,
    });
    return await this.submissionRepository.save(submission);
  }

  async findAll(): Promise<Submission[]> {
    return await this.submissionRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Submission> {
    const submission = await this.submissionRepository.findOne({
      where: { id },
      relations: ['feedback', 'knowledgeUnit'],
    });
    if (!submission) {
      throw new NotFoundException(`Submission ${id} not found`);
    }
    return submission;
  }

  async update(id: string, updateSubmissionDto: UpdateSubmissionDto): Promise<Submission> {
    const submission = await this.findOne(id);
    Object.assign(submission, updateSubmissionDto);
    return await this.submissionRepository.save(submission);
  }

  async remove(id: string): Promise<void> {
    const submission = await this.findOne(id);
    await this.submissionRepository.remove(submission);
  }

  // ==================== Filter Methods ====================

  async findByUser(userId: string): Promise<Submission[]> {
    return await this.submissionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByUnit(unitId: string): Promise<Submission[]> {
    return await this.submissionRepository.find({
      where: { unitId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByPath(pathId: string): Promise<Submission[]> {
    return await this.submissionRepository.find({
      where: { pathId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByStatus(status: string): Promise<Submission[]> {
    return await this.submissionRepository.find({
      where: { status },
      order: { createdAt: 'DESC' },
    });
  }

  async findByUserAndUnit(userId: string, unitId: string): Promise<Submission | null> {
    return await this.submissionRepository.findOne({
      where: { userId, unitId },
      relations: ['feedback'],
    });
  }

  async findByChallenge(challengeId: string): Promise<Submission[]> {
    return await this.submissionRepository.find({
      where: { challengeId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByProject(projectId: string): Promise<Submission[]> {
    return await this.submissionRepository.find({
      where: { projectId },
      order: { createdAt: 'DESC' },
    });
  }

  // ==================== Domain Methods ====================

  /**
   * Submit for review - changes status from draft to submitted
   */
  async submit(id: string): Promise<Submission> {
    const submission = await this.findOne(id);

    if (submission.status !== 'draft') {
      throw new BadRequestException(`Submission is already ${submission.status}`);
    }

    submission.status = 'submitted';
    submission.submittedAt = new Date();
    return await this.submissionRepository.save(submission);
  }

  /**
   * Get all feedback for a submission
   */
  async getFeedback(submissionId: string): Promise<Feedback[]> {
    return await this.feedbackRepository.find({
      where: { submissionId },
      order: { createdAt: 'DESC' },
    });
  }

  // ==================== AI Feedback ====================

  /**
   * Request AI feedback for a submission
   */
  async requestAiFeedback(
    submissionId: string,
    dto: RequestFeedbackDto,
  ): Promise<Feedback> {
    if (!this.anthropic) {
      throw new BadRequestException('AI feedback is not configured. Set ANTHROPIC_API_KEY.');
    }

    const submission = await this.findOne(submissionId);

    if (submission.status === 'draft') {
      throw new BadRequestException('Cannot request feedback on a draft submission. Submit it first.');
    }

    // Update status to under_review
    submission.status = 'under_review';
    await this.submissionRepository.save(submission);

    // Get the knowledge unit for context
    const knowledgeUnit = await this.knowledgeUnitRepository.findOne({
      where: { id: submission.unitId },
    });

    if (!knowledgeUnit) {
      throw new NotFoundException(`Knowledge unit ${submission.unitId} not found`);
    }

    // Get rubric criteria - convert string[] to full object format if needed
    let rubricCriteria: { name: string; maxPoints: number }[];
    if (dto.rubricCriteria && dto.rubricCriteria.length > 0) {
      // Convert string criteria names to objects with default points
      const defaultPointsPerCriterion = Math.floor(100 / dto.rubricCriteria.length);
      rubricCriteria = dto.rubricCriteria.map((name) => ({
        name,
        maxPoints: defaultPointsPerCriterion,
      }));
    } else {
      // Use default criteria based on content type
      rubricCriteria =
        DEFAULT_RUBRIC_CRITERIA[submission.contentType as keyof typeof DEFAULT_RUBRIC_CRITERIA] ||
        DEFAULT_RUBRIC_CRITERIA.code;
    }

    // Generate AI feedback
    const aiResponse = await this.generateAiFeedback(submission, knowledgeUnit, rubricCriteria);

    // Create feedback record
    const feedback = this.feedbackRepository.create({
      submissionId,
      source: 'ai',
      overallScore: aiResponse.overallScore,
      rubricBreakdown: aiResponse.rubricBreakdown,
      suggestions: aiResponse.suggestions,
      content: aiResponse.content,
    });
    await this.feedbackRepository.save(feedback);

    // Update submission with score and status
    submission.score = aiResponse.overallScore;
    submission.status = aiResponse.status || (aiResponse.overallScore >= 70 ? 'approved' : 'rejected');
    submission.reviewedAt = new Date();
    await this.submissionRepository.save(submission);

    return feedback;
  }

  private async generateAiFeedback(
    submission: Submission,
    knowledgeUnit: KnowledgeUnit,
    rubricCriteria: { name: string; maxPoints: number }[],
  ): Promise<{
    overallScore: number;
    rubricBreakdown: RubricScore[];
    suggestions: string[];
    content: string;
    status?: string;
  }> {
    const rubricText = rubricCriteria
      .map((r) => `- ${r.name} (max ${r.maxPoints} points)`)
      .join('\n');

    const prompt = EVALUATE_SUBMISSION_PROMPT
      .replace('{concept}', knowledgeUnit.concept)
      .replace('{question}', knowledgeUnit.question)
      .replace('{answer}', knowledgeUnit.answer)
      .replace('{contentType}', submission.contentType)
      .replace('{title}', submission.title)
      .replace('{content}', submission.content)
      .replace('{rubricCriteria}', rubricText);

    const response = await this.anthropic!.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseContent = response.content[0];
    if (responseContent.type !== 'text') {
      throw new Error('Unexpected response type from Claude API');
    }

    // Parse JSON (handle potential markdown wrapping)
    let jsonText = responseContent.text.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```json\n?|\n?```/g, '');
    }

    try {
      const result = JSON.parse(jsonText);
      return {
        overallScore: result.overallScore || 0,
        rubricBreakdown: result.rubricBreakdown || [],
        suggestions: result.suggestions || [],
        content: result.content || '',
        status: result.status,
      };
    } catch (error) {
      throw new BadRequestException('Failed to parse AI feedback response');
    }
  }

  // ==================== Mentor Feedback ====================

  /**
   * Find all submissions for paths assigned to a mentor
   */
  async findByMentor(mentorId: string, status?: string): Promise<Submission[]> {
    // First get all learning paths assigned to this mentor
    const paths = await this.learningPathRepository.find({
      where: { mentorId },
    });

    const pathIds = paths.map((p) => p.id);

    if (pathIds.length === 0) {
      return [];
    }

    const queryBuilder = this.submissionRepository
      .createQueryBuilder('submission')
      .leftJoinAndSelect('submission.feedback', 'feedback')
      .leftJoinAndSelect('submission.challenge', 'challenge')
      .leftJoinAndSelect('submission.project', 'project')
      .where('submission.pathId IN (:...pathIds)', { pathIds })
      .andWhere('submission.status != :draft', { draft: 'draft' });

    if (status) {
      queryBuilder.andWhere('submission.status = :status', { status });
    }

    return queryBuilder.orderBy('submission.submittedAt', 'DESC').getMany();
  }

  /**
   * Submit mentor feedback for a submission
   */
  async submitMentorFeedback(
    submissionId: string,
    mentorId: string,
    dto: CreateMentorFeedbackDto,
  ): Promise<{ feedback: Feedback; submission: Submission }> {
    const submission = await this.findOne(submissionId);

    // Verify submission is in a reviewable state
    if (submission.status === 'draft') {
      throw new BadRequestException('Cannot review a draft submission');
    }

    // Verify mentor is assigned to this path
    const learningPath = await this.learningPathRepository.findOne({
      where: { id: submission.pathId },
    });

    if (!learningPath || learningPath.mentorId !== mentorId) {
      throw new ForbiddenException('You are not the assigned mentor for this learning path');
    }

    // For project submissions, grade is required
    if (submission.projectId && !dto.grade) {
      throw new BadRequestException('Grade is required for project submissions');
    }

    // Create feedback record
    const feedback = this.feedbackRepository.create({
      submissionId,
      source: 'mentor',
      reviewerId: mentorId,
      overallScore: dto.overallScore,
      rubricBreakdown: dto.rubricBreakdown,
      suggestions: dto.suggestions,
      content: dto.content,
    });
    await this.feedbackRepository.save(feedback);

    // Update submission
    submission.score = dto.overallScore;
    submission.reviewedAt = new Date();

    // Set grade for projects
    if (submission.projectId && dto.grade) {
      submission.grade = dto.grade;
      // Update status based on grade
      submission.status = dto.grade === 'needs_work' ? 'rejected' : 'approved';
    } else {
      // For challenges, just mark as approved if score is passing
      submission.status = dto.overallScore >= 70 ? 'approved' : 'rejected';
    }

    await this.submissionRepository.save(submission);

    return { feedback, submission };
  }
}
