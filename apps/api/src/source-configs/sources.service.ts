import { BadRequestException,Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { LearningPath } from '../learning-paths/entities/learning-path.entity';
import { CreateSourceDto } from './dto/create-source.dto';
import { UpdateSourceDto } from './dto/update-source.dto';
import { Source } from './entities/source.entity';
import { SourcePathLink } from './entities/source-path-link.entity';

export interface SourceWithLink extends Source {
  enabled: boolean;
  linkId: string;
}

@Injectable()
export class SourcesService {
  constructor(
    @InjectRepository(Source)
    private readonly sourceRepository: Repository<Source>,
    @InjectRepository(SourcePathLink)
    private readonly linkRepository: Repository<SourcePathLink>,
    @InjectRepository(LearningPath)
    private readonly learningPathRepository: Repository<LearningPath>,
  ) {}

  /**
   * Get all sources
   */
  async findAll(): Promise<Source[]> {
    return await this.sourceRepository.find({
      order: { name: 'ASC' },
    });
  }

  /**
   * Get all sources with their linked learning paths
   */
  async findAllWithPaths(): Promise<Array<Source & { linkedPaths: Array<{ id: string; name: string; enabled: boolean }> }>> {
    const sources = await this.sourceRepository.find({
      order: { name: 'ASC' },
    });

    const result = await Promise.all(
      sources.map(async (source) => {
        const links = await this.linkRepository.find({
          where: { sourceId: source.id },
          relations: ['learningPath'],
        });

        return {
          ...source,
          linkedPaths: links.map((link) => ({
            id: link.pathId,
            name: link.learningPath?.name || 'Unknown',
            enabled: link.enabled,
          })),
        };
      })
    );

    return result;
  }

  /**
   * Get a single source by ID
   */
  async findOne(id: string): Promise<Source> {
    const source = await this.sourceRepository.findOne({ where: { id } });
    if (!source) {
      throw new NotFoundException(`Source with ID ${id} not found`);
    }
    return source;
  }

  /**
   * Find source by URL (for deduplication)
   */
  async findByUrl(url: string): Promise<Source | null> {
    return await this.sourceRepository.findOne({ where: { url } });
  }

  /**
   * Get all sources linked to a learning path with their enabled status
   */
  async findByPath(pathId: string): Promise<SourceWithLink[]> {
    const links = await this.linkRepository.find({
      where: { pathId },
      relations: ['source'],
    });

    return links.map((link) => ({
      ...link.source,
      enabled: link.enabled,
      linkId: link.id,
    }));
  }

  /**
   * Get enabled sources for a learning path (for ingestion)
   */
  async findEnabledByPath(pathId: string): Promise<Source[]> {
    const links = await this.linkRepository.find({
      where: { pathId, enabled: true },
      relations: ['source'],
    });

    return links.map((link) => link.source);
  }

  /**
   * Create a new source or return existing one if URL already exists
   * Returns { source, created: boolean }
   */
  async createOrFind(createSourceDto: CreateSourceDto): Promise<{ source: Source; created: boolean }> {
    // Check if source with this URL already exists
    const existing = await this.findByUrl(createSourceDto.url);
    if (existing) {
      return { source: existing, created: false };
    }

    // Create new source
    const source = this.sourceRepository.create(createSourceDto);
    const saved = await this.sourceRepository.save(source);
    return { source: saved, created: true };
  }

  /**
   * Update a source (name, type only - URL is immutable)
   */
  async update(id: string, updateSourceDto: UpdateSourceDto): Promise<Source> {
    const source = await this.findOne(id);
    Object.assign(source, updateSourceDto);
    return await this.sourceRepository.save(source);
  }

  /**
   * Delete a source (cascades to all links)
   */
  async remove(id: string): Promise<void> {
    const source = await this.findOne(id);
    await this.sourceRepository.remove(source);
  }

  /**
   * Link a source to a learning path
   */
  async linkToPath(sourceId: string, pathId: string, enabled = true): Promise<SourcePathLink> {
    // Verify source exists
    await this.findOne(sourceId);

    // Verify learning path exists
    const path = await this.learningPathRepository.findOne({ where: { id: pathId } });
    if (!path) {
      throw new NotFoundException(`Learning path with ID ${pathId} not found`);
    }

    // Check if link already exists
    const existing = await this.linkRepository.findOne({
      where: { sourceId, pathId },
    });
    if (existing) {
      throw new BadRequestException(`Source is already linked to this learning path`);
    }

    // Create link
    const link = this.linkRepository.create({
      sourceId,
      pathId,
      enabled,
    });
    return await this.linkRepository.save(link);
  }

  /**
   * Unlink a source from a learning path
   */
  async unlinkFromPath(sourceId: string, pathId: string): Promise<void> {
    const link = await this.linkRepository.findOne({
      where: { sourceId, pathId },
    });
    if (!link) {
      throw new NotFoundException(`Source is not linked to this learning path`);
    }
    await this.linkRepository.remove(link);
  }

  /**
   * Update the enabled status of a source-path link
   */
  async updateLinkEnabled(sourceId: string, pathId: string, enabled: boolean): Promise<SourcePathLink> {
    const link = await this.linkRepository.findOne({
      where: { sourceId, pathId },
    });
    if (!link) {
      throw new NotFoundException(`Source is not linked to this learning path`);
    }
    link.enabled = enabled;
    return await this.linkRepository.save(link);
  }

  /**
   * Create source and link to path in one operation (for AI suggestions)
   */
  async createAndLink(
    createSourceDto: CreateSourceDto,
    pathId: string,
    enabled = true
  ): Promise<{ source: Source; link: SourcePathLink; created: boolean }> {
    // Create or find the source
    const { source, created } = await this.createOrFind(createSourceDto);

    // Check if already linked
    const existingLink = await this.linkRepository.findOne({
      where: { sourceId: source.id, pathId },
    });

    if (existingLink) {
      return { source, link: existingLink, created: false };
    }

    // Create the link
    const link = this.linkRepository.create({
      sourceId: source.id,
      pathId,
      enabled,
    });
    const savedLink = await this.linkRepository.save(link);

    return { source, link: savedLink, created };
  }

  /**
   * Get all paths that a source is linked to
   */
  async getLinkedPaths(sourceId: string): Promise<{ pathId: string; pathName: string; enabled: boolean }[]> {
    const links = await this.linkRepository.find({
      where: { sourceId },
      relations: ['learningPath'],
    });

    return links.map((link) => ({
      pathId: link.pathId,
      pathName: link.learningPath?.name || 'Unknown',
      enabled: link.enabled,
    }));
  }
}
