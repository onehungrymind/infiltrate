import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { KnowledgeGraphService } from './knowledge-graph.service';
import { GenerateGraphDto } from './dto/generate-graph.dto';

@ApiTags('knowledge-graph')
@Controller('knowledge-graph')
export class KnowledgeGraphController {
  constructor(private readonly service: KnowledgeGraphService) {}

  @Public()
  @Post('generate')
  @ApiOperation({ summary: 'Generate knowledge graph from topic' })
  async generate(@Body() dto: GenerateGraphDto) {
    const graphData = await this.service.generateGraph(dto.topic);
    return graphData;
  }

  @Public()
  @Get('history')
  @ApiOperation({ summary: 'Get search history' })
  async getHistory(@Query('userId') userId = 'anonymous') {
    return this.service.getHistory(userId);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get graph by ID' })
  async getById(@Param('id') id: string) {
    return this.service.getById(id);
  }
}
