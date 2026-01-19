import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';

import { Session } from './entities/session.entity';
import { SessionTemplate } from './entities/session-template.entity';
import { CreateSessionDto, UpdateSessionDto, SessionQueryDto } from './dto';

export interface PaginatedSessions {
  sessions: Session[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class GymnasiumService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    @InjectRepository(SessionTemplate)
    private readonly templateRepository: Repository<SessionTemplate>,
  ) {}

  // ===========================
  // Slug Generation
  // ===========================

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 60);
  }

  private async ensureUniqueSlug(baseSlug: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (await this.sessionRepository.findOne({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  // ===========================
  // Session CRUD Operations
  // ===========================

  async createSession(
    createSessionDto: CreateSessionDto,
    creatorId: string,
  ): Promise<Session> {
    const baseSlug = this.generateSlug(createSessionDto.title);
    const slug = await this.ensureUniqueSlug(baseSlug);

    const session = this.sessionRepository.create({
      ...createSessionDto,
      slug,
      creatorId,
      tags: createSessionDto.tags || [],
      difficulty: createSessionDto.difficulty || 'beginner',
      estimatedMinutes: createSessionDto.estimatedMinutes || 60,
      visibility: createSessionDto.visibility || 'private',
    });

    return this.sessionRepository.save(session);
  }

  async findAllSessions(query: SessionQueryDto): Promise<PaginatedSessions> {
    const {
      domain,
      difficulty,
      visibility,
      creatorId,
      search,
      tag,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const where: FindOptionsWhere<Session> = {};

    if (domain) {
      where.domain = domain;
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (visibility) {
      where.visibility = visibility;
    }

    if (creatorId) {
      where.creatorId = creatorId;
    }

    // Build query
    const queryBuilder = this.sessionRepository.createQueryBuilder('session');

    // Apply where conditions
    if (domain) {
      queryBuilder.andWhere('session.domain = :domain', { domain });
    }

    if (difficulty) {
      queryBuilder.andWhere('session.difficulty = :difficulty', { difficulty });
    }

    if (visibility) {
      queryBuilder.andWhere('session.visibility = :visibility', { visibility });
    }

    if (creatorId) {
      queryBuilder.andWhere('session.creatorId = :creatorId', { creatorId });
    }

    if (search) {
      queryBuilder.andWhere(
        '(session.title LIKE :search OR session.description LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (tag) {
      // SQLite uses simple-array which stores as comma-separated
      queryBuilder.andWhere('session.tags LIKE :tag', { tag: `%${tag}%` });
    }

    // Apply sorting
    queryBuilder.orderBy(`session.${sortBy}`, sortOrder);

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Execute query
    const [sessions, total] = await queryBuilder.getManyAndCount();

    return {
      sessions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findSessionById(id: string): Promise<Session> {
    const session = await this.sessionRepository.findOne({ where: { id } });

    if (!session) {
      throw new NotFoundException(`Session with ID "${id}" not found`);
    }

    return session;
  }

  async findSessionBySlug(slug: string): Promise<Session> {
    const session = await this.sessionRepository.findOne({ where: { slug } });

    if (!session) {
      throw new NotFoundException(`Session with slug "${slug}" not found`);
    }

    return session;
  }

  async updateSession(
    id: string,
    updateSessionDto: UpdateSessionDto,
  ): Promise<Session> {
    const session = await this.findSessionById(id);

    // Handle slug update with validation
    if (updateSessionDto.slug !== undefined) {
      const newSlug = this.generateSlug(updateSessionDto.slug);

      // Check if slug is different and already taken by another session
      if (newSlug !== session.slug) {
        const existing = await this.sessionRepository.findOne({
          where: { slug: newSlug },
        });

        if (existing && existing.id !== id) {
          throw new ConflictException(`Slug "${newSlug}" is already in use`);
        }

        updateSessionDto.slug = newSlug;
      }
    }

    Object.assign(session, updateSessionDto);

    return this.sessionRepository.save(session);
  }

  async deleteSession(id: string): Promise<void> {
    const session = await this.findSessionById(id);
    await this.sessionRepository.remove(session);
  }

  async publishSession(id: string): Promise<Session> {
    const session = await this.findSessionById(id);
    session.publishedAt = new Date();
    session.visibility = 'public';
    return this.sessionRepository.save(session);
  }

  async unpublishSession(id: string): Promise<Session> {
    const session = await this.findSessionById(id);
    session.publishedAt = null;
    session.visibility = 'private';
    return this.sessionRepository.save(session);
  }

  // ===========================
  // Template Operations
  // ===========================

  async findAllTemplates(): Promise<SessionTemplate[]> {
    return this.templateRepository.find({
      order: { isSystem: 'DESC', name: 'ASC' },
    });
  }

  async findTemplateById(id: string): Promise<SessionTemplate> {
    const template = await this.templateRepository.findOne({ where: { id } });

    if (!template) {
      throw new NotFoundException(`Template with ID "${id}" not found`);
    }

    return template;
  }

  async getDefaultTemplate(): Promise<SessionTemplate> {
    const template = await this.templateRepository.findOne({
      where: { isSystem: true, name: 'Default Dark' },
    });

    if (!template) {
      // Return first system template if default not found
      const systemTemplate = await this.templateRepository.findOne({
        where: { isSystem: true },
      });

      if (!systemTemplate) {
        throw new NotFoundException('No system template found');
      }

      return systemTemplate;
    }

    return template;
  }

  async createTemplate(
    template: Partial<SessionTemplate>,
    creatorId?: string,
  ): Promise<SessionTemplate> {
    const newTemplate = this.templateRepository.create({
      ...template,
      creatorId,
      isSystem: false,
    });

    return this.templateRepository.save(newTemplate);
  }

  // ===========================
  // Utility Methods
  // ===========================

  async getSessionRaw(id: string): Promise<Session> {
    // Returns session with full content for export
    return this.findSessionById(id);
  }

  async countSessionsByCreator(creatorId: string): Promise<number> {
    return this.sessionRepository.count({ where: { creatorId } });
  }

  async getPublicSessions(limit = 10): Promise<Session[]> {
    return this.sessionRepository.find({
      where: { visibility: 'public' },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
