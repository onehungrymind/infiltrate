import Anthropic from '@anthropic-ai/sdk';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  CLASSROOM_CONTENT_SYSTEM_PROMPT,
  MICRO_QUIZ_SYSTEM_PROMPT,
  buildClassroomContentPrompt,
  buildMicroQuizPrompt,
  ClassroomContentPromptOptions,
  MicroQuizPromptOptions,
} from './generation-prompts';

import { ClassroomSection } from '../entities/classroom-content.entity';
import { MicroQuizQuestion } from '../entities/micro-quiz.entity';

export interface GeneratedClassroomContent {
  title: string;
  summary: string;
  estimatedReadTime: number;
  wordCount: number;
  sections: ClassroomSection[];
}

export interface GeneratedMicroQuiz {
  questions: MicroQuizQuestion[];
  passingScore: number;
}

@Injectable()
export class ClassroomGeneratorService {
  private readonly logger = new Logger(ClassroomGeneratorService.name);
  private anthropic: Anthropic | null = null;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    if (apiKey) {
      this.anthropic = new Anthropic({ apiKey });
      this.logger.log('Anthropic API initialized for classroom generation');
    } else {
      this.logger.warn(
        'ANTHROPIC_API_KEY not configured - AI generation will be unavailable',
      );
    }
  }

  /**
   * Generate classroom content for a sub-concept
   */
  async generateContent(
    options: ClassroomContentPromptOptions,
  ): Promise<GeneratedClassroomContent> {
    if (!this.anthropic) {
      throw new BadRequestException(
        'AI generation is not available. Please configure ANTHROPIC_API_KEY in .env',
      );
    }

    this.logger.log(
      `Generating classroom content for sub-concept: ${options.subConceptName}`,
    );

    const userPrompt = buildClassroomContentPrompt(options);

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8000,
        system: CLASSROOM_CONTENT_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new InternalServerErrorException(
          'Unexpected response type from AI',
        );
      }

      const generatedContent = this.parseResponse(content.text);
      this.validateClassroomContent(generatedContent);

      this.logger.log(
        `Successfully generated classroom content: ${generatedContent.title}`,
      );

      return {
        title: generatedContent.title,
        summary: generatedContent.summary,
        estimatedReadTime: generatedContent.estimatedReadTime || 10,
        wordCount: generatedContent.wordCount || 0,
        sections: this.normalizeSections(generatedContent.sections),
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      this.logger.error('Failed to generate classroom content', error);

      if (error.message?.includes('JSON')) {
        throw new BadRequestException(
          'AI returned invalid JSON. Please try again.',
        );
      }

      throw new InternalServerErrorException(
        `Failed to generate classroom content: ${error.message}`,
      );
    }
  }

  /**
   * Generate micro-quiz for a sub-concept
   */
  async generateQuiz(
    options: MicroQuizPromptOptions,
  ): Promise<GeneratedMicroQuiz> {
    if (!this.anthropic) {
      throw new BadRequestException(
        'AI generation is not available. Please configure ANTHROPIC_API_KEY in .env',
      );
    }

    this.logger.log(
      `Generating micro-quiz for sub-concept: ${options.subConceptName}`,
    );

    const userPrompt = buildMicroQuizPrompt(options);

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        system: MICRO_QUIZ_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new InternalServerErrorException(
          'Unexpected response type from AI',
        );
      }

      const generatedQuiz = this.parseResponse(content.text);
      this.validateQuiz(generatedQuiz);

      this.logger.log(
        `Successfully generated micro-quiz with ${generatedQuiz.questions.length} questions`,
      );

      return {
        questions: this.normalizeQuestions(generatedQuiz.questions),
        passingScore: generatedQuiz.passingScore || 70,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      this.logger.error('Failed to generate micro-quiz', error);

      if (error.message?.includes('JSON')) {
        throw new BadRequestException(
          'AI returned invalid JSON for quiz. Please try again.',
        );
      }

      throw new InternalServerErrorException(
        `Failed to generate micro-quiz: ${error.message}`,
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
      } catch {
        this.logger.warn('Initial JSON parse failed, attempting repair...');
      }

      // Attempt to repair common JSON errors from AI
      jsonStr = this.repairJson(jsonStr);

      try {
        return JSON.parse(jsonStr);
      } catch (e) {
        this.logger.warn('Standard repair failed, trying aggressive repair...');

        // Try more aggressive repair
        jsonStr = this.aggressiveRepairJson(jsonMatch[0]);

        try {
          return JSON.parse(jsonStr);
        } catch (e2) {
          this.logger.error('Failed to parse after aggressive repair', e2);
          if (e2 instanceof SyntaxError && e2.message.includes('position')) {
            const posMatch = e2.message.match(/position (\d+)/);
            if (posMatch) {
              const pos = parseInt(posMatch[1], 10);
              const start = Math.max(0, pos - 100);
              const end = Math.min(jsonStr.length, pos + 100);
              this.logger.error(
                `JSON context around error: ...${jsonStr.slice(start, end)}...`,
              );
            }
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

    // Remove BOM first
    repaired = repaired.replace(/^\uFEFF/, '');

    // Escape literal newlines inside strings (must do this first)
    repaired = this.escapeNewlinesInStrings(repaired);

    // Fix trailing commas before ] or }
    repaired = repaired.replace(/,(\s*[\]}])/g, '$1');

    // Add missing commas between objects in arrays (handles nested objects too)
    // Match } followed by optional whitespace and { - need comma between them
    repaired = repaired.replace(/\}(\s*)\{/g, '},$1{');

    // Add missing commas after } when followed by newlines and then "key":
    // This handles: }  \n  "nextKey":
    repaired = repaired.replace(/\}(\s*\n\s*)"([^"]+)":/g, '},$1"$2":');

    // Handle missing commas between array elements that are strings
    repaired = repaired.replace(/"(\s*)\n(\s*)"/g, '",$1\n$2"');

    // Handle missing commas after numbers/booleans/null before next element
    repaired = repaired.replace(
      /(\d|true|false|null)(\s*)\n(\s*)"([^"]+)":/g,
      '$1,$2\n$3"$4":',
    );

    // Handle missing commas between arrays
    repaired = repaired.replace(/\](\s*)\[/g, '],$1[');

    // Handle missing commas between ] and {
    repaired = repaired.replace(/\](\s*)\{/g, '],$1{');

    // Handle missing commas between } and [
    repaired = repaired.replace(/\}(\s*)\[/g, '},$1[');

    // Handle missing commas after ] when followed by "key":
    repaired = repaired.replace(/\](\s*\n\s*)"([^"]+)":/g, '],$1"$2":');

    // Remove any double commas that might have been introduced
    repaired = repaired.replace(/,,+/g, ',');

    return repaired;
  }

  /**
   * More aggressive JSON repair that rebuilds the structure
   */
  private aggressiveRepairJson(json: string): string {
    // First do the standard repairs
    let repaired = this.repairJson(json);

    // Try to find and fix truncated JSON by balancing brackets
    const openBraces = (repaired.match(/\{/g) || []).length;
    const closeBraces = (repaired.match(/\}/g) || []).length;
    const openBrackets = (repaired.match(/\[/g) || []).length;
    const closeBrackets = (repaired.match(/\]/g) || []).length;

    // Add missing closing brackets/braces
    if (openBraces > closeBraces) {
      repaired = repaired + '}'.repeat(openBraces - closeBraces);
    }
    if (openBrackets > closeBrackets) {
      // Need to close arrays before closing objects
      const insertPos = repaired.lastIndexOf('}');
      if (insertPos > 0) {
        repaired =
          repaired.slice(0, insertPos) +
          ']'.repeat(openBrackets - closeBrackets) +
          repaired.slice(insertPos);
      } else {
        repaired = repaired + ']'.repeat(openBrackets - closeBrackets);
      }
    }

    // Fix incomplete string values (string that starts with " but never closes)
    // Look for patterns like: "key": "value without closing quote }
    repaired = repaired.replace(
      /"([^"]*?)(\s*[}\]])$/gm,
      (match, content, ending) => {
        // If the string looks incomplete, close it
        if (!match.endsWith('"' + ending.trim())) {
          return `"${content}"${ending}`;
        }
        return match;
      },
    );

    // Remove trailing commas that might appear at the end of the JSON
    repaired = repaired.replace(/,(\s*[}\]])/g, '$1');

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
        result.push('\\n');
        continue;
      }

      if (inString && char === '\r') {
        continue;
      }

      if (inString && char === '\t') {
        result.push('\\t');
        continue;
      }

      result.push(char);
    }

    return result.join('');
  }

  /**
   * Validate classroom content structure
   */
  private validateClassroomContent(content: any): void {
    if (!content.title || typeof content.title !== 'string') {
      throw new BadRequestException('Generated content missing title');
    }

    if (!content.summary || typeof content.summary !== 'string') {
      throw new BadRequestException('Generated content missing summary');
    }

    if (!content.sections || !Array.isArray(content.sections)) {
      throw new BadRequestException('Generated content missing sections array');
    }

    if (content.sections.length === 0) {
      throw new BadRequestException('Generated content has no sections');
    }

    for (const section of content.sections) {
      if (!section.id || !section.type) {
        throw new BadRequestException('Invalid section: missing id or type');
      }

      const validTypes = ['prose', 'code', 'diagram', 'callout', 'example'];
      if (!validTypes.includes(section.type)) {
        throw new BadRequestException(`Invalid section type: ${section.type}`);
      }
    }
  }

  /**
   * Validate quiz structure
   */
  private validateQuiz(quiz: any): void {
    if (!quiz.questions || !Array.isArray(quiz.questions)) {
      throw new BadRequestException('Generated quiz missing questions array');
    }

    if (quiz.questions.length === 0) {
      throw new BadRequestException('Generated quiz has no questions');
    }

    for (const question of quiz.questions) {
      if (!question.id || !question.type || !question.question) {
        throw new BadRequestException(
          'Invalid question: missing id, type, or question text',
        );
      }

      if (question.correctAnswer === undefined) {
        throw new BadRequestException('Question missing correctAnswer');
      }

      if (!question.explanation) {
        throw new BadRequestException('Question missing explanation');
      }
    }
  }

  /**
   * Normalize sections to ensure proper structure
   */
  private normalizeSections(sections: any[]): ClassroomSection[] {
    return sections.map((section, index) => ({
      id: section.id || `section-${index + 1}`,
      order: section.order ?? index + 1,
      type: section.type,
      content: section.content,
      code: section.code,
      diagram: section.diagram,
      callout: section.callout,
    }));
  }

  /**
   * Normalize questions to ensure proper structure
   */
  private normalizeQuestions(questions: any[]): MicroQuizQuestion[] {
    return questions.map((q, index) => ({
      id: q.id || `question-${index + 1}`,
      order: q.order ?? index + 1,
      type: q.type,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      sourceKuId: q.sourceKuId,
    }));
  }
}
