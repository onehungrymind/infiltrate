import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { LearningPath } from '../learning-paths/entities/learning-path.entity';
import { Concept } from '../concepts/entities/concept.entity';
import { SubConcept } from '../sub-concepts/entities/sub-concept.entity';

import {
  ClassroomContent,
  ClassroomContentStatus,
} from './entities/classroom-content.entity';
import { ReadingProgress, ReadingStatus } from './entities/reading-progress.entity';
import { ReadingPreferences } from './entities/reading-preferences.entity';
import { MicroQuiz } from './entities/micro-quiz.entity';
import { MicroQuizAttempt, QuizAnswer, QuizResult } from './entities/micro-quiz-attempt.entity';

import {
  CreateClassroomContentDto,
  UpdateClassroomContentDto,
} from './dto/classroom-content.dto';
import { UpdateReadingProgressDto } from './dto/reading-progress.dto';
import { UpdateReadingPreferencesDto } from './dto/reading-preferences.dto';
import { SubmitMicroQuizDto } from './dto/micro-quiz.dto';

@Injectable()
export class ClassroomService {
  constructor(
    @InjectRepository(ClassroomContent)
    private readonly contentRepository: Repository<ClassroomContent>,
    @InjectRepository(ReadingProgress)
    private readonly progressRepository: Repository<ReadingProgress>,
    @InjectRepository(ReadingPreferences)
    private readonly preferencesRepository: Repository<ReadingPreferences>,
    @InjectRepository(MicroQuiz)
    private readonly quizRepository: Repository<MicroQuiz>,
    @InjectRepository(MicroQuizAttempt)
    private readonly attemptRepository: Repository<MicroQuizAttempt>,
  ) {}

  // ==================== CLASSROOM CONTENT ====================

  async createContent(dto: CreateClassroomContentDto): Promise<ClassroomContent> {
    const content = this.contentRepository.create({
      ...dto,
      status: 'ready',
      generatedAt: new Date(),
    });
    return await this.contentRepository.save(content);
  }

  async findContentBySubConcept(subConceptId: string): Promise<ClassroomContent | null> {
    return await this.contentRepository.findOne({
      where: { subConceptId },
    });
  }

  async findContentByConcept(conceptId: string): Promise<ClassroomContent[]> {
    return await this.contentRepository.find({
      where: { conceptId },
      order: { createdAt: 'ASC' },
    });
  }

  async findContentByLearningPath(learningPathId: string): Promise<ClassroomContent[]> {
    return await this.contentRepository.find({
      where: { learningPathId },
      order: { createdAt: 'ASC' },
    });
  }

  async updateContent(id: string, dto: UpdateClassroomContentDto): Promise<ClassroomContent> {
    const content = await this.contentRepository.findOne({ where: { id } });
    if (!content) {
      throw new NotFoundException(`ClassroomContent with ID ${id} not found`);
    }
    Object.assign(content, dto);
    if (dto.sections || dto.title || dto.summary) {
      content.regeneratedAt = new Date();
      content.version += 1;
    }
    return await this.contentRepository.save(content);
  }

  async updateContentStatus(
    id: string,
    status: ClassroomContentStatus,
    errorMessage?: string,
  ): Promise<ClassroomContent> {
    const content = await this.contentRepository.findOne({ where: { id } });
    if (!content) {
      throw new NotFoundException(`ClassroomContent with ID ${id} not found`);
    }
    content.status = status;
    if (status === 'ready') {
      content.generatedAt = new Date();
      content.errorMessage = null;
    }
    if (status === 'error' && errorMessage) {
      content.errorMessage = errorMessage;
    }
    return await this.contentRepository.save(content);
  }

  async getClassroomStatus(learningPathId: string) {
    const contents = await this.findContentByLearningPath(learningPathId);

    // Group by concept
    const conceptMap = new Map<string, ClassroomContent[]>();
    for (const content of contents) {
      const existing = conceptMap.get(content.conceptId) || [];
      existing.push(content);
      conceptMap.set(content.conceptId, existing);
    }

    const concepts = Array.from(conceptMap.entries()).map(([conceptId, subContents]) => ({
      conceptId,
      status: subContents.every(c => c.status === 'ready')
        ? 'ready'
        : subContents.some(c => c.status === 'generating')
        ? 'generating'
        : subContents.some(c => c.status === 'error')
        ? 'error'
        : 'pending',
      subConcepts: subContents.map(c => ({
        subConceptId: c.subConceptId,
        status: c.status,
      })),
    }));

    const completed = contents.filter(c => c.status === 'ready').length;
    const total = contents.length;

    return {
      status: total === 0
        ? 'pending'
        : completed === total
        ? 'ready'
        : completed > 0
        ? 'partial'
        : contents.some(c => c.status === 'generating')
        ? 'generating'
        : 'pending',
      progress: { completed, total },
      concepts,
    };
  }

  // ==================== READING PROGRESS ====================

  async getOrCreateProgress(
    userId: string,
    classroomContentId: string,
  ): Promise<ReadingProgress> {
    let progress = await this.progressRepository.findOne({
      where: { userId, classroomContentId },
    });

    if (!progress) {
      const content = await this.contentRepository.findOne({
        where: { id: classroomContentId },
      });
      if (!content) {
        throw new NotFoundException(`ClassroomContent with ID ${classroomContentId} not found`);
      }

      progress = this.progressRepository.create({
        userId,
        classroomContentId,
        subConceptId: content.subConceptId,
        conceptId: content.conceptId,
        learningPathId: content.learningPathId,
        status: 'not_started',
        scrollPosition: 0,
        totalReadTime: 0,
        sessionCount: 0,
      });
      progress = await this.progressRepository.save(progress);
    }

    return progress;
  }

  async updateProgress(
    userId: string,
    classroomContentId: string,
    dto: UpdateReadingProgressDto,
  ): Promise<ReadingProgress> {
    const progress = await this.getOrCreateProgress(userId, classroomContentId);

    if (dto.scrollPosition !== undefined) {
      progress.scrollPosition = dto.scrollPosition;
      progress.lastReadAt = new Date();

      // Update status based on scroll position
      if (progress.status === 'not_started') {
        progress.status = 'in_progress';
        progress.sessionCount += 1;
      }
    }

    if (dto.readTime !== undefined && dto.readTime > 0) {
      progress.totalReadTime += dto.readTime;
    }

    return await this.progressRepository.save(progress);
  }

  async markAsComplete(userId: string, classroomContentId: string): Promise<ReadingProgress> {
    const progress = await this.getOrCreateProgress(userId, classroomContentId);
    progress.status = 'completed';
    progress.scrollPosition = 100;
    progress.completedAt = new Date();
    progress.lastReadAt = new Date();
    return await this.progressRepository.save(progress);
  }

  async getConceptProgress(userId: string, conceptId: string) {
    const contents = await this.findContentByConcept(conceptId);
    const progressList = await this.progressRepository.find({
      where: { userId, conceptId },
    });

    const progressMap = new Map(progressList.map(p => [p.subConceptId, p]));

    const subConcepts = contents.map(content => ({
      subConceptId: content.subConceptId,
      progress: progressMap.get(content.subConceptId) || {
        status: 'not_started',
        scrollPosition: 0,
        totalReadTime: 0,
      },
    }));

    const completedCount = subConcepts.filter(
      sc => sc.progress.status === 'completed',
    ).length;
    const overallProgress =
      contents.length > 0 ? (completedCount / contents.length) * 100 : 0;

    return {
      conceptId,
      overallProgress,
      subConcepts,
    };
  }

  // ==================== READING PREFERENCES ====================

  async getOrCreatePreferences(userId: string): Promise<ReadingPreferences> {
    let prefs = await this.preferencesRepository.findOne({
      where: { userId },
    });

    if (!prefs) {
      prefs = this.preferencesRepository.create({
        userId,
        theme: 'light',
        fontSize: 'medium',
        lineSpacing: 'normal',
        fontFamily: 'sans',
      });
      prefs = await this.preferencesRepository.save(prefs);
    }

    return prefs;
  }

  async updatePreferences(
    userId: string,
    dto: UpdateReadingPreferencesDto,
  ): Promise<ReadingPreferences> {
    const prefs = await this.getOrCreatePreferences(userId);
    Object.assign(prefs, dto);
    return await this.preferencesRepository.save(prefs);
  }

  // ==================== MICRO QUIZ ====================

  async createQuiz(
    subConceptId: string,
    classroomContentId: string,
    questions: any[],
  ): Promise<MicroQuiz> {
    // Delete existing quiz if any
    await this.quizRepository.delete({ subConceptId });

    const quiz = this.quizRepository.create({
      subConceptId,
      classroomContentId,
      questions,
      status: 'ready',
      generatedAt: new Date(),
    });
    return await this.quizRepository.save(quiz);
  }

  async findQuizBySubConcept(subConceptId: string): Promise<MicroQuiz | null> {
    return await this.quizRepository.findOne({
      where: { subConceptId },
    });
  }

  async submitQuiz(
    userId: string,
    microQuizId: string,
    dto: SubmitMicroQuizDto,
  ): Promise<MicroQuizAttempt> {
    const quiz = await this.quizRepository.findOne({
      where: { id: microQuizId },
    });
    if (!quiz) {
      throw new NotFoundException(`MicroQuiz with ID ${microQuizId} not found`);
    }

    // Grade the quiz
    const results: QuizResult[] = [];
    let correctCount = 0;

    for (const answer of dto.answers) {
      const question = quiz.questions.find(q => q.id === answer.questionId);
      if (!question) continue;

      const isCorrect =
        String(answer.answer).toLowerCase() ===
        String(question.correctAnswer).toLowerCase();

      if (isCorrect) correctCount++;

      results.push({
        questionId: answer.questionId,
        correct: isCorrect,
        userAnswer: answer.answer,
        correctAnswer: question.correctAnswer,
      });
    }

    const score = (correctCount / quiz.questions.length) * 100;
    const passed = score >= quiz.passingScore;

    const attempt = this.attemptRepository.create({
      userId,
      microQuizId,
      answers: dto.answers,
      results,
      score,
      passed,
      startedAt: new Date(), // Could be passed from frontend
    });

    return await this.attemptRepository.save(attempt);
  }

  async getQuizAttempts(userId: string, microQuizId: string): Promise<MicroQuizAttempt[]> {
    return await this.attemptRepository.find({
      where: { userId, microQuizId },
      order: { completedAt: 'DESC' },
    });
  }

  // ==================== HELPER: Create placeholder content ====================

  async createPlaceholderContent(
    subConceptId: string,
    conceptId: string,
    learningPathId: string,
    title: string,
  ): Promise<ClassroomContent> {
    const existing = await this.findContentBySubConcept(subConceptId);
    if (existing) {
      return existing;
    }

    const content = this.contentRepository.create({
      subConceptId,
      conceptId,
      learningPathId,
      title,
      summary: '',
      sections: [],
      status: 'pending',
      sourceKuIds: [],
    });
    return await this.contentRepository.save(content);
  }

  // ==================== ADMIN METHODS ====================

  async getOverviewStats() {
    const total = await this.contentRepository.count();
    const ready = await this.contentRepository.count({ where: { status: 'ready' } });
    const generating = await this.contentRepository.count({ where: { status: 'generating' } });
    const pending = await this.contentRepository.count({ where: { status: 'pending' } });
    const error = await this.contentRepository.count({ where: { status: 'error' } });

    // Get unique learning paths count
    const pathsResult = await this.contentRepository
      .createQueryBuilder('content')
      .select('COUNT(DISTINCT content.learningPathId)', 'count')
      .getRawOne();
    const learningPathsCount = parseInt(pathsResult?.count || '0', 10);

    // Get unique concepts count
    const conceptsResult = await this.contentRepository
      .createQueryBuilder('content')
      .select('COUNT(DISTINCT content.conceptId)', 'count')
      .getRawOne();
    const conceptsCount = parseInt(conceptsResult?.count || '0', 10);

    return {
      total,
      byStatus: { ready, generating, pending, error },
      learningPathsCount,
      conceptsCount,
      completionRate: total > 0 ? Math.round((ready / total) * 100) : 0,
    };
  }

  async getDetailedPathStatus(learningPathId: string) {
    const contents = await this.contentRepository.find({
      where: { learningPathId },
      order: { createdAt: 'ASC' },
    });

    // Group by concept
    const conceptMap = new Map<string, ClassroomContent[]>();
    for (const content of contents) {
      const existing = conceptMap.get(content.conceptId) || [];
      existing.push(content);
      conceptMap.set(content.conceptId, existing);
    }

    const concepts = Array.from(conceptMap.entries()).map(([conceptId, subContents]) => {
      const ready = subContents.filter(c => c.status === 'ready').length;
      const total = subContents.length;
      return {
        conceptId,
        status: ready === total ? 'ready' : ready > 0 ? 'partial' : 'pending',
        progress: { ready, total },
        subConcepts: subContents.map(c => ({
          subConceptId: c.subConceptId,
          title: c.title,
          status: c.status,
          errorMessage: c.errorMessage,
          generatedAt: c.generatedAt,
          version: c.version,
        })),
      };
    });

    const totalReady = contents.filter(c => c.status === 'ready').length;
    const totalCount = contents.length;

    return {
      learningPathId,
      status: totalReady === totalCount && totalCount > 0 ? 'ready' : totalReady > 0 ? 'partial' : 'pending',
      progress: { ready: totalReady, total: totalCount },
      concepts,
    };
  }

  async getContentList(query: { page?: number; limit?: number; status?: string; learningPathId?: string; conceptId?: string }) {
    const { page = 1, limit = 20, status, learningPathId, conceptId } = query;

    const qb = this.contentRepository.createQueryBuilder('content');

    if (status) {
      qb.andWhere('content.status = :status', { status });
    }
    if (learningPathId) {
      qb.andWhere('content.learningPathId = :learningPathId', { learningPathId });
    }
    if (conceptId) {
      qb.andWhere('content.conceptId = :conceptId', { conceptId });
    }

    qb.orderBy('content.createdAt', 'DESC');

    const [items, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getContentById(contentId: string): Promise<ClassroomContent> {
    const content = await this.contentRepository.findOne({ where: { id: contentId } });
    if (!content) {
      throw new NotFoundException(`ClassroomContent with ID ${contentId} not found`);
    }
    return content;
  }

  async getContentWithErrors() {
    return await this.contentRepository.find({
      where: { status: 'error' },
      order: { updatedAt: 'DESC' },
    });
  }

  async getLearningPathInfo(learningPathId: string) {
    // Import LearningPath repository dynamically since we have it in the module
    const learningPath = await this.contentRepository.manager
      .getRepository(LearningPath)
      .findOne({ where: { id: learningPathId } });

    if (!learningPath) {
      throw new NotFoundException(`LearningPath with ID ${learningPathId} not found`);
    }

    return {
      id: learningPath.id,
      name: learningPath.name,
    };
  }

  async getSubConceptInfo(subConceptId: string) {
    const subConcept = await this.contentRepository.manager
      .getRepository(SubConcept)
      .findOne({
        where: { id: subConceptId },
        relations: ['concept', 'concept.learningPath'],
      });

    if (!subConcept) {
      throw new NotFoundException(`SubConcept with ID ${subConceptId} not found`);
    }

    return {
      subConceptId: subConcept.id,
      subConceptName: subConcept.name,
      conceptId: subConcept.concept?.id,
      conceptName: subConcept.concept?.name,
      learningPathId: subConcept.concept?.learningPath?.id,
    };
  }

  async getConceptInfo(conceptId: string) {
    const concept = await this.contentRepository.manager
      .getRepository(Concept)
      .findOne({
        where: { id: conceptId },
        relations: ['learningPath', 'subConcepts'],
      });

    if (!concept) {
      throw new NotFoundException(`Concept with ID ${conceptId} not found`);
    }

    return {
      conceptId: concept.id,
      conceptName: concept.name,
      learningPathId: concept.learningPath?.id,
      subConcepts: concept.subConcepts.map(sc => ({
        id: sc.id,
        name: sc.name,
      })),
    };
  }

  async clearPathContent(learningPathId: string) {
    const result = await this.contentRepository.delete({ learningPathId });
    return {
      learningPathId,
      deletedCount: result.affected || 0,
    };
  }

  async approveContent(contentId: string) {
    const content = await this.getContentById(contentId);
    content.status = 'ready';
    content.generatedAt = new Date();
    return await this.contentRepository.save(content);
  }
}
