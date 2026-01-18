import { Body, Controller, ParseArrayPipe, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Public } from '../auth/decorators/public.decorator';
import { CreateKnowledgeUnitDto } from '../knowledge-units/dto/create-knowledge-unit.dto';
import { KnowledgeUnit } from '../knowledge-units/entities/knowledge-unit.entity';
import { CreateRawContentDto } from '../raw-content/dto/create-raw-content.dto';
import { RawContent } from '../raw-content/entities/raw-content.entity';
import { IngestionService } from './ingestion.service';

@ApiTags('ingestion')
@Controller('ingestion')
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Public()
  @Post('raw-content')
  @ApiOperation({ summary: 'Ingest a single raw content item' })
  @ApiResponse({
    status: 201,
    description: 'Raw content successfully ingested',
    type: RawContent,
  })
  async ingestRawContent(
    @Body() createRawContentDto: CreateRawContentDto,
  ): Promise<RawContent> {
    return await this.ingestionService.ingestRawContent(createRawContentDto);
  }

  @Public()
  @Post('raw-content/batch')
  @ApiOperation({ summary: 'Ingest multiple raw content items in batch' })
  @ApiResponse({
    status: 201,
    description: 'Raw content items successfully ingested',
    type: [RawContent],
  })
  async ingestRawContentBatch(
    @Body(new ParseArrayPipe({ items: CreateRawContentDto }))
    createRawContentDtos: CreateRawContentDto[],
  ): Promise<RawContent[]> {
    return await this.ingestionService.ingestRawContentBatch(
      createRawContentDtos,
    );
  }

  @Public()
  @Post('knowledge-units')
  @ApiOperation({ summary: 'Ingest a single knowledge unit' })
  @ApiResponse({
    status: 201,
    description: 'Knowledge unit successfully ingested',
    type: KnowledgeUnit,
  })
  async ingestKnowledgeUnit(
    @Body() createKnowledgeUnitDto: CreateKnowledgeUnitDto,
  ): Promise<KnowledgeUnit> {
    return await this.ingestionService.ingestKnowledgeUnit(
      createKnowledgeUnitDto,
    );
  }

  @Public()
  @Post('knowledge-units/batch')
  @ApiOperation({ summary: 'Ingest multiple knowledge units in batch' })
  @ApiResponse({
    status: 201,
    description: 'Knowledge units successfully ingested',
    type: [KnowledgeUnit],
  })
  async ingestKnowledgeUnitsBatch(
    @Body(new ParseArrayPipe({ items: CreateKnowledgeUnitDto }))
    createKnowledgeUnitDtos: CreateKnowledgeUnitDto[],
  ): Promise<KnowledgeUnit[]> {
    return await this.ingestionService.ingestKnowledgeUnitsBatch(
      createKnowledgeUnitDtos,
    );
  }
}

