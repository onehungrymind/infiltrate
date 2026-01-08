import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Anthropic from '@anthropic-ai/sdk';
import { GENERATE_KNOWLEDGE_GRAPH_PROMPT } from './prompts/generate-graph.prompt';
import { GraphSearch } from './entities/graph-search.entity';

@Injectable()
export class KnowledgeGraphService {
  private anthropic: Anthropic;

  constructor(
    @InjectRepository(GraphSearch)
    private readonly searchRepo: Repository<GraphSearch>,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    if (!apiKey) {
      throw new Error(
        'ANTHROPIC_API_KEY is not set. Please add it to your .env file in apps/api/.env',
      );
    }
    this.anthropic = new Anthropic({
      apiKey,
    });
  }

  async generateGraph(topic: string, userId = 'anonymous') {
    // Generate graph from Claude
    const graphData = await this.generateGraphFromClaude(topic);

    // Save to database
    const search = this.searchRepo.create({
      userId,
      topic,
      graphData,
    });
    await this.searchRepo.save(search);

    return { id: search.id, ...graphData };
  }

  private async generateGraphFromClaude(topic: string) {
    const prompt = GENERATE_KNOWLEDGE_GRAPH_PROMPT.replace('{topic}', topic);

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude API');
    }

    // Parse JSON (handle potential markdown wrapping)
    let jsonText = content.text.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```json\n?|\n?```/g, '');
    }

    const graphData = JSON.parse(jsonText);
    return graphData;
  }

  async getHistory(userId = 'anonymous') {
    return this.searchRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 10,
    });
  }

  async getById(id: string) {
    const search = await this.searchRepo.findOne({ where: { id } });
    if (!search) {
      return null;
    }
    return { id: search.id, ...search.graphData };
  }
}
