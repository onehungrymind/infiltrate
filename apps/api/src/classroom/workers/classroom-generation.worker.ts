import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { QUEUE_NAMES } from '../../jobs/queues/queue.constants';
import {
  GenerateClassroomContentJobData,
  GenerateClassroomForPathJobData,
  ClassroomProgressEvent,
} from '../../jobs/queues/job-data.types';
import { KnowledgeUnit } from '../../knowledge-units/entities/knowledge-unit.entity';
import { SubConcept } from '../../sub-concepts/entities/sub-concept.entity';
import { Concept } from '../../concepts/entities/concept.entity';
import { LearningPath } from '../../learning-paths/entities/learning-path.entity';

import { ClassroomService } from '../classroom.service';
import { ClassroomGeneratorService } from '../generation/classroom-generator.service';

@Processor(QUEUE_NAMES.CLASSROOM_GENERATION)
export class ClassroomGenerationWorker extends WorkerHost {
  private readonly logger = new Logger(ClassroomGenerationWorker.name);

  constructor(
    private readonly classroomService: ClassroomService,
    private readonly generatorService: ClassroomGeneratorService,
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(KnowledgeUnit)
    private readonly kuRepository: Repository<KnowledgeUnit>,
    @InjectRepository(SubConcept)
    private readonly subConceptRepository: Repository<SubConcept>,
    @InjectRepository(Concept)
    private readonly conceptRepository: Repository<Concept>,
    @InjectRepository(LearningPath)
    private readonly pathRepository: Repository<LearningPath>,
  ) {
    super();
  }

  async process(
    job: Job<GenerateClassroomForPathJobData | GenerateClassroomContentJobData>,
  ): Promise<void> {
    const { name, data } = job;

    this.logger.log(`Processing job: ${name}`);

    if ('subConceptId' in data) {
      await this.processSubConceptContent(data as GenerateClassroomContentJobData);
    } else {
      await this.processFullPath(data as GenerateClassroomForPathJobData);
    }
  }

  /**
   * Generate classroom content for an entire learning path
   */
  private async processFullPath(data: GenerateClassroomForPathJobData): Promise<void> {
    const { learningPathId, learningPathName } = data;

    this.logger.log(`[Classroom] Starting generation for path: ${learningPathName}`);

    this.emitProgress({
      learningPathId,
      type: 'started',
      message: `Starting classroom generation for "${learningPathName}"`,
      timestamp: new Date(),
    });

    try {
      // Get all concepts for this learning path
      const concepts = await this.conceptRepository.find({
        where: { pathId: learningPathId },
        order: { order: 'ASC' },
      });

      // Get all sub-concepts for each concept
      const allSubConcepts: Array<{
        subConcept: SubConcept;
        concept: Concept;
      }> = [];

      for (const concept of concepts) {
        const subConcepts = await this.subConceptRepository.find({
          where: { conceptId: concept.id },
          order: { order: 'ASC' },
        });

        for (const sc of subConcepts) {
          allSubConcepts.push({ subConcept: sc, concept });
        }
      }

      const total = allSubConcepts.length;
      let completed = 0;

      this.logger.log(`[Classroom] Found ${total} sub-concepts to generate`);

      // Generate content for each sub-concept
      for (const { subConcept, concept } of allSubConcepts) {
        this.emitProgress({
          learningPathId,
          type: 'subconcept-generating',
          conceptId: concept.id,
          subConceptId: subConcept.id,
          message: `Generating content for "${subConcept.name}"`,
          progress: {
            completed,
            total,
            percentage: Math.round((completed / total) * 100),
          },
          timestamp: new Date(),
        });

        try {
          await this.generateForSubConcept(
            learningPathId,
            learningPathName,
            concept,
            subConcept,
          );

          completed++;

          this.emitProgress({
            learningPathId,
            type: 'subconcept-ready',
            conceptId: concept.id,
            subConceptId: subConcept.id,
            message: `Generated content for "${subConcept.name}"`,
            progress: {
              completed,
              total,
              percentage: Math.round((completed / total) * 100),
            },
            timestamp: new Date(),
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          this.logger.error(
            `[Classroom] Failed to generate for sub-concept ${subConcept.name}: ${errorMessage}`,
          );

          this.emitProgress({
            learningPathId,
            type: 'subconcept-failed',
            conceptId: concept.id,
            subConceptId: subConcept.id,
            message: `Failed to generate content for "${subConcept.name}"`,
            error: errorMessage,
            timestamp: new Date(),
          });
        }
      }

      this.emitProgress({
        learningPathId,
        type: 'path-ready',
        message: `Classroom generation complete for "${learningPathName}"`,
        progress: {
          completed,
          total,
          percentage: 100,
        },
        timestamp: new Date(),
      });

      this.logger.log(`[Classroom] Completed generation for path: ${learningPathName}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`[Classroom] Failed: ${errorMessage}`);

      this.emitProgress({
        learningPathId,
        type: 'failed',
        message: `Classroom generation failed for "${learningPathName}"`,
        error: errorMessage,
        timestamp: new Date(),
      });

      throw error;
    }
  }

  /**
   * Generate classroom content for a single sub-concept
   */
  private async processSubConceptContent(
    data: GenerateClassroomContentJobData,
  ): Promise<void> {
    const { learningPathId, conceptId, conceptName, subConceptId, subConceptName } = data;

    this.logger.log(`[Classroom] Generating content for sub-concept: ${subConceptName}`);

    const path = await this.pathRepository.findOne({ where: { id: learningPathId } });
    const concept = await this.conceptRepository.findOne({ where: { id: conceptId } });
    const subConcept = await this.subConceptRepository.findOne({ where: { id: subConceptId } });

    if (!path || !concept || !subConcept) {
      throw new Error('Learning path, concept, or sub-concept not found');
    }

    await this.generateForSubConcept(learningPathId, path.name, concept, subConcept);
  }

  /**
   * Generate content and quiz for a single sub-concept
   */
  private async generateForSubConcept(
    learningPathId: string,
    learningPathName: string,
    concept: Concept,
    subConcept: SubConcept,
  ): Promise<void> {
    // Create placeholder content first (if not exists)
    const placeholder = await this.classroomService.createPlaceholderContent(
      subConcept.id,
      concept.id,
      learningPathId,
      subConcept.name,
    );

    // Update status to generating
    await this.classroomService.updateContentStatus(placeholder.id, 'generating');

    try {
      // Gather knowledge units for this sub-concept
      const knowledgeUnits = await this.kuRepository.find({
        where: { subConceptId: subConcept.id },
      });

      if (knowledgeUnits.length === 0) {
        this.logger.warn(
          `[Classroom] No KUs found for sub-concept ${subConcept.name}, using concept-level KUs`,
        );

        // Fallback to concept-level KUs
        const conceptKUs = await this.kuRepository.find({
          where: { conceptId: concept.id },
          take: 10,
        });

        if (conceptKUs.length === 0) {
          throw new Error(`No knowledge units found for sub-concept or concept`);
        }

        knowledgeUnits.push(...conceptKUs);
      }

      // Transform KUs into content format
      const kuContent = knowledgeUnits.map((ku) => ({
        id: ku.id,
        title: ku.question,
        content: this.formatKUForPrompt(ku),
      }));

      // Generate classroom content
      const generatedContent = await this.generatorService.generateContent({
        subConceptName: subConcept.name,
        conceptName: concept.name,
        learningPathName,
        knowledgeUnits: kuContent,
      });

      // Save the generated content
      await this.classroomService.updateContent(placeholder.id, {
        title: generatedContent.title,
        summary: generatedContent.summary,
        sections: generatedContent.sections,
        estimatedReadTime: generatedContent.estimatedReadTime,
        wordCount: generatedContent.wordCount,
        status: 'ready',
        sourceKuIds: knowledgeUnits.map((ku) => ku.id),
      });

      // Generate micro-quiz
      const lessonText = this.extractLessonText(generatedContent.sections);
      const generatedQuiz = await this.generatorService.generateQuiz({
        subConceptName: subConcept.name,
        lessonContent: lessonText,
      });

      // Save the quiz
      await this.classroomService.createQuiz(
        subConcept.id,
        placeholder.id,
        generatedQuiz.questions,
      );

      this.logger.log(`[Classroom] Successfully generated content for: ${subConcept.name}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Update status to error
      await this.classroomService.updateContentStatus(
        placeholder.id,
        'error',
        errorMessage,
      );

      throw error;
    }
  }

  /**
   * Format a knowledge unit for the prompt
   */
  private formatKUForPrompt(ku: KnowledgeUnit): string {
    const parts = [
      `Question: ${ku.question}`,
      `Answer: ${ku.answer}`,
    ];

    if (ku.elaboration) {
      parts.push(`Elaboration: ${ku.elaboration}`);
    }

    if (ku.examples?.length > 0) {
      parts.push(`Examples: ${ku.examples.join(', ')}`);
    }

    if (ku.analogies?.length > 0) {
      parts.push(`Analogies: ${ku.analogies.join(', ')}`);
    }

    if (ku.commonMistakes?.length > 0) {
      parts.push(`Common Mistakes: ${ku.commonMistakes.join(', ')}`);
    }

    return parts.join('\n');
  }

  /**
   * Extract plain text from sections for quiz generation
   */
  private extractLessonText(sections: any[]): string {
    const textParts: string[] = [];

    for (const section of sections) {
      if (section.content) {
        textParts.push(section.content);
      }
      if (section.callout?.content) {
        textParts.push(section.callout.content);
      }
      if (section.code?.caption) {
        textParts.push(section.code.caption);
      }
      if (section.diagram?.caption) {
        textParts.push(section.diagram.caption);
      }
    }

    return textParts.join('\n\n');
  }

  /**
   * Emit progress event via WebSocket
   */
  private emitProgress(event: ClassroomProgressEvent): void {
    this.eventEmitter.emit('classroom.progress', event);
  }
}
