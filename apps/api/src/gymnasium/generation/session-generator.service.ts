import Anthropic from '@anthropic-ai/sdk';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { SessionContent } from '@kasita/common-models';

import { GenerateSessionDto } from '../dto';
import { GENERATION_SYSTEM_PROMPT, buildUserPrompt } from './generation-prompts';

export interface GeneratedSession {
  title: string;
  subtitle?: string;
  description: string;
  domain: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimatedMinutes: number;
  badgeText?: string;
  coverMeta?: string[];
  content: SessionContent;
}

@Injectable()
export class SessionGeneratorService {
  private readonly logger = new Logger(SessionGeneratorService.name);
  private anthropic: Anthropic | null = null;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    if (apiKey) {
      this.anthropic = new Anthropic({ apiKey });
      this.logger.log('Anthropic API initialized for session generation');
    } else {
      this.logger.warn(
        'ANTHROPIC_API_KEY not configured - AI generation will be unavailable',
      );
    }
  }

  /**
   * Generate a complete session using AI
   */
  async generateSession(dto: GenerateSessionDto): Promise<GeneratedSession> {
    if (!this.anthropic) {
      throw new BadRequestException(
        'AI generation is not available. Please configure ANTHROPIC_API_KEY in .env',
      );
    }

    this.logger.log(`Generating session for topic: ${dto.topic}`);

    const userPrompt = buildUserPrompt({
      topic: dto.topic,
      targetAudience: dto.targetAudience,
      difficulty: dto.difficulty,
      estimatedLength: dto.estimatedLength,
      focusAreas: dto.focusAreas,
      codeLanguage: dto.codeLanguage,
      tone: dto.tone,
    });

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8000,
        system: GENERATION_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new InternalServerErrorException(
          'Unexpected response type from AI',
        );
      }

      // Parse the JSON response
      const generatedContent = this.parseResponse(content.text);

      // Validate the structure
      this.validateGeneratedContent(generatedContent);

      this.logger.log(
        `Successfully generated session: ${generatedContent.title}`,
      );

      return {
        title: generatedContent.title,
        subtitle: generatedContent.subtitle,
        description: generatedContent.description,
        domain: generatedContent.domain,
        tags: generatedContent.tags || [],
        difficulty: generatedContent.difficulty || dto.difficulty || 'intermediate',
        estimatedMinutes: generatedContent.estimatedMinutes || 60,
        badgeText: generatedContent.badgeText,
        coverMeta: generatedContent.coverMeta,
        content: {
          parts: generatedContent.parts,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error('Failed to generate session', error);

      if (error.message?.includes('JSON')) {
        throw new BadRequestException(
          'AI returned invalid JSON. Please try again.',
        );
      }

      throw new InternalServerErrorException(
        `Failed to generate session: ${error.message}`,
      );
    }
  }

  /**
   * Parse the AI response and extract JSON
   */
  private parseResponse(text: string): any {
    // Try to parse directly first
    try {
      return JSON.parse(text);
    } catch {
      // If that fails, try to extract JSON from the response
    }

    // Try to find JSON in the response (in case there's extra text)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        this.logger.error('Failed to parse extracted JSON', e);
      }
    }

    throw new BadRequestException(
      'Could not parse AI response as JSON. The AI may have returned invalid content.',
    );
  }

  /**
   * Validate the generated content structure
   */
  private validateGeneratedContent(content: any): void {
    if (!content.title || typeof content.title !== 'string') {
      throw new BadRequestException('Generated content missing title');
    }

    if (!content.description || typeof content.description !== 'string') {
      throw new BadRequestException('Generated content missing description');
    }

    if (!content.parts || !Array.isArray(content.parts)) {
      throw new BadRequestException('Generated content missing parts array');
    }

    if (content.parts.length === 0) {
      throw new BadRequestException('Generated content has no parts');
    }

    // Validate each part
    for (const part of content.parts) {
      if (!part.id || !part.title || !part.sections) {
        throw new BadRequestException(
          `Invalid part structure: missing id, title, or sections`,
        );
      }

      if (!Array.isArray(part.sections) || part.sections.length === 0) {
        throw new BadRequestException(
          `Part "${part.title}" has no sections`,
        );
      }

      // Validate each section
      for (const section of part.sections) {
        if (!section.id || !section.title || !section.anchor || !section.blocks) {
          throw new BadRequestException(
            `Invalid section structure in part "${part.title}"`,
          );
        }

        if (!Array.isArray(section.blocks)) {
          throw new BadRequestException(
            `Section "${section.title}" blocks must be an array`,
          );
        }
      }
    }
  }
}
