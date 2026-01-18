import { Injectable, Logger } from '@nestjs/common';

import { CreateKnowledgeUnitDto } from '../knowledge-units/dto/create-knowledge-unit.dto';
import { KnowledgeUnit } from '../knowledge-units/entities/knowledge-unit.entity';
import { KnowledgeUnitsService } from '../knowledge-units/knowledge-units.service';
import { CreateRawContentDto } from '../raw-content/dto/create-raw-content.dto';
import { RawContent } from '../raw-content/entities/raw-content.entity';
import { RawContentService } from '../raw-content/raw-content.service';

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  constructor(
    private readonly rawContentService: RawContentService,
    private readonly knowledgeUnitsService: KnowledgeUnitsService,
  ) {}

  /**
   * Ingest a single raw content item
   */
  async ingestRawContent(
    createRawContentDto: CreateRawContentDto,
  ): Promise<RawContent> {
    return await this.rawContentService.create(createRawContentDto);
  }

  /**
   * Ingest multiple raw content items in batch
   */
  async ingestRawContentBatch(
    createRawContentDtos: CreateRawContentDto[],
  ): Promise<RawContent[]> {
    const results: RawContent[] = [];
    for (const dto of createRawContentDtos) {
      try {
        const rawContent = await this.rawContentService.create(dto);
        results.push(rawContent);
      } catch (error) {
        // Log error but continue processing other items
        console.error(`Failed to ingest raw content: ${dto.title}`, error);
      }
    }
    return results;
  }

  /**
   * Ingest a single knowledge unit
   */
  async ingestKnowledgeUnit(
    createKnowledgeUnitDto: CreateKnowledgeUnitDto,
  ): Promise<KnowledgeUnit> {
    return await this.knowledgeUnitsService.create(createKnowledgeUnitDto);
  }

  /**
   * Ingest multiple knowledge units in batch
   */
  async ingestKnowledgeUnitsBatch(
    createKnowledgeUnitDtos: CreateKnowledgeUnitDto[],
  ): Promise<KnowledgeUnit[]> {
    this.logger.log(`[BATCH] Received ${createKnowledgeUnitDtos.length} knowledge units to ingest`);

    if (createKnowledgeUnitDtos.length > 0) {
      const sample = createKnowledgeUnitDtos[0];
      this.logger.log(`[BATCH] Sample unit - pathId: ${sample.pathId}, concept: ${sample.concept}, difficulty: ${sample.difficulty}, cognitiveLevel: ${sample.cognitiveLevel}`);
    }

    const results: KnowledgeUnit[] = [];
    let successCount = 0;
    let errorCount = 0;

    for (const dto of createKnowledgeUnitDtos) {
      try {
        const knowledgeUnit = await this.knowledgeUnitsService.create(dto);
        results.push(knowledgeUnit);
        successCount++;
      } catch (error) {
        errorCount++;
        this.logger.error(
          `[BATCH] Failed to ingest knowledge unit "${dto.concept}": ${error instanceof Error ? error.message : error}`,
        );
      }
    }

    this.logger.log(`[BATCH] Completed: ${successCount} succeeded, ${errorCount} failed`);
    return results;
  }
}
