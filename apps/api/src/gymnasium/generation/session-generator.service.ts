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
      let jsonStr = jsonMatch[0];

      // Try to parse as-is first
      try {
        return JSON.parse(jsonStr);
      } catch (e) {
        this.logger.warn('Initial JSON parse failed, attempting repair...');
      }

      // Attempt to repair common JSON errors from AI
      jsonStr = this.repairJson(jsonStr);

      try {
        return JSON.parse(jsonStr);
      } catch (e) {
        this.logger.error('Failed to parse repaired JSON', e);
        // Log a snippet around the error position for debugging
        if (e instanceof SyntaxError && e.message.includes('position')) {
          const posMatch = e.message.match(/position (\d+)/);
          if (posMatch) {
            const pos = parseInt(posMatch[1], 10);
            const start = Math.max(0, pos - 50);
            const end = Math.min(jsonStr.length, pos + 50);
            this.logger.error(
              `JSON context around error: ...${jsonStr.slice(start, end)}...`,
            );
          }
        }
      }
    }

    throw new BadRequestException(
      'Could not parse AI response as JSON. The AI may have returned invalid content.',
    );
  }

  /**
   * Attempt to repair common JSON errors produced by AI
   */
  private repairJson(json: string): string {
    let repaired = json;

    // Fix 1: Remove trailing commas before ] or }
    repaired = repaired.replace(/,(\s*[\]}])/g, '$1');

    // Fix 2: Add missing commas between array elements
    // Pattern: }\s*{ or ]\s*[ or "\s*" (when they should be separated by commas)
    // This handles objects in arrays: }{ -> },{
    repaired = repaired.replace(/\}(\s*)\{/g, '},$1{');

    // Fix 3: Handle missing commas between array elements that are strings
    // Pattern: "value"\n"nextValue" -> "value",\n"nextValue"
    repaired = repaired.replace(/"(\s*)\n(\s*)"/g, '",$1\n$2"');

    // Fix 4: Handle missing commas after numbers/booleans/null before next element
    // "key": value\n"nextKey" -> "key": value,\n"nextKey"
    repaired = repaired.replace(
      /(\d|true|false|null)(\s*)\n(\s*)"([^"]+)":/g,
      '$1,$2\n$3"$4":',
    );

    // Fix 5: Handle missing commas between array elements (][ -> ],[)
    repaired = repaired.replace(/\](\s*)\[/g, '],$1[');

    // Fix 6: Remove any BOM or special characters at the start
    repaired = repaired.replace(/^\uFEFF/, '');

    // Fix 7: Handle unescaped newlines within strings (common in prose blocks)
    // This is tricky - we need to escape literal newlines that are inside string values
    repaired = this.escapeNewlinesInStrings(repaired);

    return repaired;
  }

  /**
   * Escape literal newlines inside JSON string values
   */
  private escapeNewlinesInStrings(json: string): string {
    const result: string[] = [];
    let inString = false;
    let escaped = false;

    for (let i = 0; i < json.length; i++) {
      const char = json[i];

      if (escaped) {
        result.push(char);
        escaped = false;
        continue;
      }

      if (char === '\\') {
        result.push(char);
        escaped = true;
        continue;
      }

      if (char === '"') {
        inString = !inString;
        result.push(char);
        continue;
      }

      if (inString && char === '\n') {
        // Replace literal newline with escaped newline
        result.push('\\n');
        continue;
      }

      if (inString && char === '\r') {
        // Skip carriage returns, they'll be handled with \n
        continue;
      }

      if (inString && char === '\t') {
        // Escape tabs
        result.push('\\t');
        continue;
      }

      result.push(char);
    }

    return result.join('');
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
