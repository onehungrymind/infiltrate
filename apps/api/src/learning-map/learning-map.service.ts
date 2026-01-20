import Anthropic from '@anthropic-ai/sdk';
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { exec } from 'child_process';
import { Repository } from 'typeorm';
import { promisify } from 'util';

import { DECOMPOSE_CONCEPT_PROMPT } from './prompts/decompose-concept.prompt';
import { GENERATE_CONCEPTS_PROMPT } from './prompts/generate-concepts.prompt';
import { GENERATE_STRUCTURED_KU_PROMPT } from './prompts/generate-structured-ku.prompt';
import { SUGGEST_SOURCES_PROMPT } from './prompts/suggest-sources.prompt';

const execAsync = promisify(exec);
import {
  LearningMapEdge,
  LearningMapNode,
  LearningMapProgress,
  LearningPathMap,
  NodeDetails,
  NodeStatus,
  ConceptNodeData,
} from '@kasita/common-models';

import { KnowledgeUnit } from '../knowledge-units/entities/knowledge-unit.entity';
import { LearningPath } from '../learning-paths/entities/learning-path.entity';
import { NotebookProgress } from '../notebooks/entities/notebook-progress.entity';
import { Concept } from '../concepts/entities/concept.entity';
import { RawContent } from '../raw-content/entities/raw-content.entity';
import { SourcePathLink } from '../source-configs/entities/source-path-link.entity';
import { SourcesService } from '../source-configs/sources.service';
import { SubConcept } from '../sub-concepts/entities/sub-concept.entity';

@Injectable()
export class LearningMapService {
  private readonly logger = new Logger(LearningMapService.name);
  private anthropic: Anthropic;

  constructor(
    @InjectRepository(LearningPath)
    private readonly learningPathRepository: Repository<LearningPath>,
    @InjectRepository(NotebookProgress)
    private readonly notebookProgressRepository: Repository<NotebookProgress>,
    @InjectRepository(Concept)
    private readonly conceptRepository: Repository<Concept>,
    @InjectRepository(KnowledgeUnit)
    private readonly knowledgeUnitRepository: Repository<KnowledgeUnit>,
    @InjectRepository(SourcePathLink)
    private readonly sourcePathLinkRepository: Repository<SourcePathLink>,
    @InjectRepository(RawContent)
    private readonly rawContentRepository: Repository<RawContent>,
    @InjectRepository(SubConcept)
    private readonly subConceptRepository: Repository<SubConcept>,
    private readonly configService: ConfigService,
    private readonly sourcesService: SourcesService,
  ) {
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    if (apiKey) {
      this.anthropic = new Anthropic({ apiKey });
    }
  }

  /**
   * Get learning path map structure
   * For now, returns mock data. In production, this would:
   * 1. Fetch learning path from database
   * 2. Generate nodes and edges based on path structure
   * 3. Calculate positions using layout algorithm
   * 4. Merge with user progress data
   */
  async getLearningPath(userId: string, outcomeId: string): Promise<LearningPathMap> {
    // TODO: Implement actual data fetching and path generation
    // For now, return null to trigger mock data in frontend
    throw new NotFoundException('Learning path not found. Using mock data for demo.');
  }

  /**
   * Get user progress for a learning path
   */
  async getUserProgress(userId: string, pathId: string): Promise<LearningMapProgress> {
    // TODO: Fetch from database
    return {
      userId,
      pathId,
      nodeProgress: {},
      lastUpdated: new Date(),
    };
  }

  /**
   * Get detailed information about a specific node
   */
  async getNodeDetails(nodeId: string): Promise<NodeDetails> {
    // TODO: Fetch node details from database
    throw new NotFoundException(`Node ${nodeId} not found`);
  }

  /**
   * Update node status
   */
  async updateNodeStatus(
    nodeId: string,
    status: string,
    metrics?: Record<string, any>,
  ): Promise<void> {
    // TODO: Update node progress in database
    // This would update a learning_map_progress table
  }

  /**
   * Unlock a node when prerequisites are met
   */
  async unlockNode(nodeId: string): Promise<void> {
    // TODO: Check prerequisites and unlock if met
  }

  /**
   * Record node completion with metrics
   */
  async recordNodeCompletion(nodeId: string, metrics: Record<string, any>): Promise<void> {
    // TODO: Save completion to database
    // Update progress, unlock dependent nodes, etc.
  }

  /**
   * Get estimated time to completion
   */
  async getEstimatedTimeToCompletion(outcomeId: string): Promise<{ hours: number; days: number }> {
    // TODO: Calculate based on remaining nodes and their estimated times
    return { hours: 0, days: 0 };
  }

  /**
   * Get principle-based learning map for a learning path
   * This creates a visualization of principles and their prerequisites
   */
  async getConceptMap(pathId: string): Promise<LearningPathMap> {
    // Fetch the learning path
    const learningPath = await this.learningPathRepository.findOne({
      where: { id: pathId },
    });

    if (!learningPath) {
      throw new NotFoundException(`Learning path ${pathId} not found`);
    }

    // Fetch all principles for this learning path
    const concepts = await this.conceptRepository.find({
      where: { pathId },
      order: { order: 'ASC' },
    });

    if (concepts.length === 0) {
      throw new NotFoundException(`No principles found for learning path ${pathId}`);
    }

    // Count knowledge units per principle
    const knowledgeUnitCounts = await this.getKnowledgeUnitCounts(concepts.map(p => p.id));

    // Convert concepts to learning map nodes
    const nodes = this.convertConceptsToNodes(concepts, knowledgeUnitCounts);

    // Generate edges from prerequisites
    const edges = this.generatePrerequisiteEdges(concepts);

    // Calculate layout positions using hierarchical layout
    this.calculateHierarchicalLayout(nodes, concepts);

    // Calculate metadata
    const completedNodes = nodes.filter(
      n => n.status === 'completed' || n.status === 'mastered'
    ).length;

    const totalEstimatedHours = concepts.reduce(
      (sum, p) => sum + (p.estimatedHours || 0),
      0
    );

    return {
      id: `principle-map-${pathId}`,
      outcomeId: pathId,
      nodes,
      edges,
      metadata: {
        totalNodes: nodes.length,
        completedNodes,
        estimatedTime: totalEstimatedHours,
        progress: nodes.length > 0 ? Math.round((completedNodes / nodes.length) * 100) : 0,
      },
    };
  }

  /**
   * Get all learning paths with their principle counts
   */
  async getLearningPathsForMap(): Promise<Array<{
    id: string;
    name: string;
    domain: string;
    conceptCount: number;
  }>> {
    const learningPaths = await this.learningPathRepository.find();

    const result = await Promise.all(
      learningPaths.map(async (path) => {
        const conceptCount = await this.conceptRepository.count({
          where: { pathId: path.id },
        });
        return {
          id: path.id,
          name: path.name,
          domain: path.domain,
          conceptCount,
        };
      })
    );

    // Only return paths that have principles
    return result.filter(p => p.conceptCount > 0);
  }

  /**
   * Get knowledge unit counts per principle
   */
  private async getKnowledgeUnitCounts(conceptIds: string[]): Promise<Record<string, number>> {
    const counts: Record<string, number> = {};

    for (const conceptId of conceptIds) {
      const count = await this.knowledgeUnitRepository.count({
        where: { conceptId },
      });
      counts[conceptId] = count;
    }

    return counts;
  }

  /**
   * Convert Concept entities to LearningMapNode format
   */
  private convertConceptsToNodes(
    concepts: Concept[],
    knowledgeUnitCounts: Record<string, number>,
  ): LearningMapNode[] {
    return concepts.map((concept) => {
      // Map concept status to node status
      const statusMap: Record<string, NodeStatus> = {
        pending: 'not-started',
        in_progress: 'in-progress',
        mastered: 'completed',
      };

      const nodeData: ConceptNodeData = {
        title: concept.name,
        description: concept.description,
        difficulty: concept.difficulty as 'foundational' | 'intermediate' | 'advanced',
        estimatedHours: concept.estimatedHours || 0,
        prerequisites: concept.prerequisites || [],
        order: concept.order || 0,
        knowledgeUnitCount: knowledgeUnitCounts[concept.id] || 0,
      };

      return {
        id: concept.id,
        type: 'concept' as const,
        label: concept.name,
        status: statusMap[concept.status] || 'not-started',
        position: { x: 0, y: 0 }, // Will be calculated by layout
        data: nodeData,
      };
    });
  }

  /**
   * Generate edges from concept prerequisites
   */
  private generatePrerequisiteEdges(concepts: Concept[]): LearningMapEdge[] {
    const edges: LearningMapEdge[] = [];
    const conceptIds = new Set(concepts.map(c => c.id));

    for (const concept of concepts) {
      if (concept.prerequisites && concept.prerequisites.length > 0) {
        for (const prereqId of concept.prerequisites) {
          // Only create edges for prerequisites that exist in this path
          if (conceptIds.has(prereqId)) {
            edges.push({
              id: `edge-${prereqId}-${concept.id}`,
              source: prereqId,
              target: concept.id,
              type: 'prerequisite',
            });
          }
        }
      }
    }

    return edges;
  }

  /**
   * Calculate hierarchical layout positions for nodes
   * Places nodes in rows based on their order, with foundational at top
   */
  private calculateHierarchicalLayout(
    nodes: LearningMapNode[],
    concepts: Concept[],
  ): void {
    // Group concepts by difficulty level
    const difficultyOrder = ['foundational', 'intermediate', 'advanced'];
    const nodesByDifficulty: Record<string, LearningMapNode[]> = {
      foundational: [],
      intermediate: [],
      advanced: [],
    };

    for (const node of nodes) {
      const concept = concepts.find(c => c.id === node.id);
      const difficulty = concept?.difficulty || 'foundational';
      if (nodesByDifficulty[difficulty]) {
        nodesByDifficulty[difficulty].push(node);
      }
    }

    // Layout constants
    const horizontalSpacing = 280;
    const verticalSpacing = 150;
    const startX = 100;
    const startY = 100;

    // Position nodes by difficulty level (rows)
    let currentY = startY;

    for (const difficulty of difficultyOrder) {
      const rowNodes = nodesByDifficulty[difficulty];
      if (rowNodes.length === 0) continue;

      // Sort by order within each difficulty level
      rowNodes.sort((a, b) => {
        const conceptA = concepts.find(c => c.id === a.id);
        const conceptB = concepts.find(c => c.id === b.id);
        return (conceptA?.order || 0) - (conceptB?.order || 0);
      });

      // Center the row
      const rowWidth = (rowNodes.length - 1) * horizontalSpacing;
      let currentX = startX + (800 - rowWidth) / 2; // Assuming 800px canvas width

      for (const node of rowNodes) {
        node.position = { x: currentX, y: currentY };
        currentX += horizontalSpacing;
      }

      currentY += verticalSpacing;
    }
  }

  /**
   * Generate concepts for a learning path using AI
   * @param pathId - The learning path ID to generate concepts for
   * @param force - If true, delete existing concepts before generating new ones
   * @returns The generated concepts and updated learning path map
   */
  async generateConceptsWithAI(pathId: string, force = false): Promise<{
    concepts: Concept[];
    message: string;
  }> {
    if (!this.anthropic) {
      throw new BadRequestException(
        'AI generation is not available. Please configure ANTHROPIC_API_KEY in .env'
      );
    }

    // Fetch the learning path
    const learningPath = await this.learningPathRepository.findOne({
      where: { id: pathId },
    });

    if (!learningPath) {
      throw new NotFoundException(`Learning path ${pathId} not found`);
    }

    // Check if concepts already exist
    const existingConcepts = await this.conceptRepository.find({
      where: { pathId },
    });

    if (existingConcepts.length > 0) {
      if (force) {
        // First, unlink any knowledge units from these concepts
        const conceptIds = existingConcepts.map(p => p.id);
        await this.knowledgeUnitRepository
          .createQueryBuilder()
          .update()
          .set({ conceptId: null })
          .where('conceptId IN (:...ids)', { ids: conceptIds })
          .execute();

        // Then delete existing concepts
        await this.conceptRepository.remove(existingConcepts);
      } else {
        throw new BadRequestException(
          `Learning path already has ${existingConcepts.length} concepts. Delete them first to regenerate.`
        );
      }
    }

    // Generate concepts using Claude
    const generatedData = await this.generateConceptsFromClaude(
      learningPath.name,
      learningPath.domain,
      learningPath.targetSkill
    );

    // Create a map of temporary IDs to real UUIDs
    const idMap = new Map<string, string>();

    // First pass: create all concepts to get their UUIDs
    const savedConcepts: Concept[] = [];

    for (const conceptData of generatedData.concepts) {
      const concept = this.conceptRepository.create({
        pathId,
        name: conceptData.name,
        description: conceptData.description,
        difficulty: conceptData.difficulty,
        estimatedHours: conceptData.estimatedHours || 1,
        prerequisites: [], // Will update in second pass
        order: conceptData.order || 0,
        status: 'pending',
      });

      const saved = await this.conceptRepository.save(concept);
      savedConcepts.push(saved);
      idMap.set(conceptData.id, saved.id);
    }

    // Second pass: update prerequisites with real UUIDs
    for (let i = 0; i < generatedData.concepts.length; i++) {
      const conceptData = generatedData.concepts[i];
      const savedConcept = savedConcepts[i];

      if (conceptData.prerequisites && conceptData.prerequisites.length > 0) {
        const realPrerequisites = conceptData.prerequisites
          .map((prereqId: string) => idMap.get(prereqId))
          .filter((id: string | undefined): id is string => id !== undefined);

        savedConcept.prerequisites = realPrerequisites;
        await this.conceptRepository.save(savedConcept);
      }
    }

    // Reload all concepts with updated prerequisites
    const finalConcepts = await this.conceptRepository.find({
      where: { pathId },
      order: { order: 'ASC' },
    });

    return {
      concepts: finalConcepts,
      message: `Successfully generated ${finalConcepts.length} concepts for "${learningPath.name}"`,
    };
  }

  /**
   * Call Claude API to generate concepts
   */
  private async generateConceptsFromClaude(
    name: string,
    domain: string,
    targetSkill: string
  ): Promise<{ concepts: Array<{
    id: string;
    name: string;
    description: string;
    difficulty: string;
    estimatedHours: number;
    prerequisites: string[];
    order: number;
  }> }> {
    const prompt = GENERATE_CONCEPTS_PROMPT
      .replace('{name}', name)
      .replace('{domain}', domain)
      .replace('{targetSkill}', targetSkill);

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new BadRequestException('Unexpected response type from Claude API');
    }

    // Parse JSON (handle potential markdown wrapping)
    let jsonText = content.text.trim();
    this.logger.log(`[GENERATE_CONCEPTS] Raw AI response (first 500 chars): ${jsonText.substring(0, 500)}`);

    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```json\n?|\n?```/g, '').trim();
      this.logger.log(`[GENERATE_CONCEPTS] After removing markdown: ${jsonText.substring(0, 500)}`);
    }

    try {
      const data = JSON.parse(jsonText);
      this.logger.log(`[GENERATE_CONCEPTS] Parsed data keys: ${Object.keys(data).join(', ')}`);
      if (!data.concepts || !Array.isArray(data.concepts)) {
        this.logger.error(`[GENERATE_CONCEPTS] Invalid structure. Has concepts: ${!!data.concepts}, Is array: ${Array.isArray(data.concepts)}`);
        throw new Error('Invalid response structure');
      }
      return data;
    } catch (error) {
      this.logger.error(`[GENERATE_CONCEPTS] Parse error: ${error instanceof Error ? error.message : 'Unknown'}`);
      this.logger.error(`[GENERATE_CONCEPTS] JSON text was: ${jsonText.substring(0, 1000)}`);
      throw new BadRequestException(
        `Failed to parse AI response: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Suggest content sources for a learning path using AI
   * @param pathId - The learning path ID to suggest sources for
   * @returns Suggested source configurations
   */
  async suggestSourcesWithAI(pathId: string): Promise<{
    sources: Array<{
      name: string;
      url: string;
      type: string;
      description: string;
      reputation: string;
    }>;
    message: string;
  }> {
    if (!this.anthropic) {
      throw new BadRequestException(
        'AI generation is not available. Please configure ANTHROPIC_API_KEY in .env'
      );
    }

    // Fetch the learning path
    const learningPath = await this.learningPathRepository.findOne({
      where: { id: pathId },
    });

    if (!learningPath) {
      throw new NotFoundException(`Learning path ${pathId} not found`);
    }

    // Generate source suggestions using Claude
    const prompt = SUGGEST_SOURCES_PROMPT
      .replace('{name}', learningPath.name)
      .replace('{domain}', learningPath.domain || '')
      .replace('{targetSkill}', learningPath.targetSkill || '');

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new BadRequestException('Unexpected response type from Claude API');
    }

    // Parse JSON (handle potential markdown wrapping)
    let jsonText = content.text.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```json\n?|\n?```/g, '');
    }

    try {
      const data = JSON.parse(jsonText);
      if (!data.sources || !Array.isArray(data.sources)) {
        throw new Error('Invalid response structure');
      }

      return {
        sources: data.sources,
        message: `Found ${data.sources.length} recommended sources for "${learningPath.name}"`,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to parse AI response: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Add a suggested source to the learning path
   * Uses the new many-to-many Source model
   */
  async addSuggestedSource(
    pathId: string,
    source: { name: string; url: string; type: string }
  ): Promise<{ id: string; url: string; type: string; name: string; enabled: boolean; created: boolean }> {
    // Use the SourcesService to create and link in one operation
    const { source: savedSource, link, created } = await this.sourcesService.createAndLink(
      { url: source.url, type: source.type, name: source.name },
      pathId,
      true // enabled
    );

    return {
      id: savedSource.id,
      url: savedSource.url,
      type: savedSource.type,
      name: savedSource.name,
      enabled: link.enabled,
      created,
    };
  }

  /**
   * Trigger content ingestion for a learning path
   * Runs the Patchbay Python app to ingest content from configured sources
   */
  async triggerIngestion(pathId: string): Promise<{
    status: 'completed' | 'failed';
    message: string;
    sourcesProcessed: number;
    itemsIngested: number;
  }> {
    this.logger.log(`[INGEST] Starting ingestion for path: ${pathId}`);

    // Verify the learning path exists
    const learningPath = await this.learningPathRepository.findOne({
      where: { id: pathId },
    });

    if (!learningPath) {
      this.logger.error(`[INGEST] Learning path not found: ${pathId}`);
      throw new NotFoundException(`Learning path ${pathId} not found`);
    }

    this.logger.log(`[INGEST] Found learning path: "${learningPath.name}"`);

    // Check if there are enabled sources for this path (with source data)
    const enabledSourceLinks = await this.sourcePathLinkRepository.find({
      where: { pathId, enabled: true },
      relations: ['source'],
    });

    if (enabledSourceLinks.length === 0) {
      this.logger.warn(`[INGEST] No enabled sources found for path: ${pathId}`);
      throw new BadRequestException(
        `No enabled sources found for this learning path. Add sources first.`
      );
    }

    // Extract source URLs to pass to patchbay
    const sourceUrls = enabledSourceLinks
      .filter(link => link.source?.url)
      .map(link => link.source.url);

    this.logger.log(`[INGEST] Found ${enabledSourceLinks.length} enabled sources:`);
    sourceUrls.forEach((url, i) => {
      this.logger.log(`[INGEST]   ${i + 1}. ${url}`);
    });

    // Count raw content before ingestion
    const rawContentBefore = await this.rawContentRepository.count({
      where: { pathId },
    });
    this.logger.log(`[INGEST] Raw content before: ${rawContentBefore} items`);

    // Get the API URL from config
    const apiUrl = this.configService.get<string>('API_URL') || 'http://localhost:3333/api';
    this.logger.log(`[INGEST] Using API URL: ${apiUrl}`);
    this.logger.log(`[INGEST] Running Patchbay ingestion subprocess...`);

    try {
      // Run the Patchbay ingestion command with sources passed directly
      const { stdout, stderr } = await execAsync(
        `cd apps/patchbay && uv run python -m src.main ingest`,
        {
          timeout: 300000, // 5 minute timeout
          maxBuffer: 1024 * 1024 * 10, // 10MB buffer
          env: {
            ...process.env,
            API_URL: apiUrl,
            DEFAULT_PATH_ID: pathId,
            SOURCES_JSON: JSON.stringify(sourceUrls),
          },
        }
      );

      if (stdout) {
        this.logger.log(`[INGEST] Patchbay stdout:\n${stdout}`);
      }
      if (stderr) {
        this.logger.warn(`[INGEST] Patchbay stderr:\n${stderr}`);
      }

      // Count raw content after ingestion
      const rawContentAfter = await this.rawContentRepository.count({
        where: { pathId },
      });

      const itemsIngested = rawContentAfter - rawContentBefore;
      this.logger.log(`[INGEST] Completed! Raw content after: ${rawContentAfter} items (+${itemsIngested} new)`);

      return {
        status: 'completed',
        message: `Successfully ingested content from ${enabledSourceLinks.length} sources`,
        sourcesProcessed: enabledSourceLinks.length,
        itemsIngested,
      };
    } catch (error: any) {
      const errorMessage = error.stderr || error.message || 'Unknown error';
      this.logger.error(`[INGEST] Failed: ${errorMessage}`);
      if (error.stdout) {
        this.logger.error(`[INGEST] stdout before failure:\n${error.stdout}`);
      }
      throw new BadRequestException(`Ingestion failed: ${errorMessage}`);
    }
  }

  /**
   * Trigger content synthesis for a learning path
   * Runs the Synthesizer Python app to generate knowledge units from raw content
   */
  async triggerSynthesis(pathId: string): Promise<{
    status: 'completed' | 'failed';
    message: string;
    rawContentProcessed: number;
    knowledgeUnitsGenerated: number;
  }> {
    this.logger.log(`[SYNTHESIZE] Starting synthesis for path: ${pathId}`);

    // Verify the learning path exists
    const learningPath = await this.learningPathRepository.findOne({
      where: { id: pathId },
    });

    if (!learningPath) {
      this.logger.error(`[SYNTHESIZE] Learning path not found: ${pathId}`);
      throw new NotFoundException(`Learning path ${pathId} not found`);
    }

    this.logger.log(`[SYNTHESIZE] Found learning path: "${learningPath.name}"`);

    // Check if there's raw content to synthesize
    const rawContentCount = await this.rawContentRepository.count({
      where: { pathId },
    });

    if (rawContentCount === 0) {
      this.logger.warn(`[SYNTHESIZE] No raw content found for path: ${pathId}`);
      throw new BadRequestException(
        `No raw content found for this learning path. Run ingestion first.`
      );
    }

    this.logger.log(`[SYNTHESIZE] Found ${rawContentCount} raw content items to process`);

    // Count knowledge units before synthesis
    const unitsBefore = await this.knowledgeUnitRepository.count({
      where: { pathId },
    });
    this.logger.log(`[SYNTHESIZE] Knowledge units before: ${unitsBefore}`);

    // Also count ALL knowledge units to check if they're being saved with wrong pathId
    const totalUnits = await this.knowledgeUnitRepository.count();
    this.logger.log(`[SYNTHESIZE] Total knowledge units in DB (all paths): ${totalUnits}`);

    // Get the API URL from config
    const apiUrl = this.configService.get<string>('API_URL') || 'http://localhost:3333/api';
    this.logger.log(`[SYNTHESIZE] Using API URL: ${apiUrl}`);
    this.logger.log(`[SYNTHESIZE] Running Synthesizer subprocess (10 min timeout)...`);

    const startTime = Date.now();

    try {
      // Run the Synthesizer process command
      const { stdout, stderr } = await execAsync(
        `cd apps/synthesizer && API_URL="${apiUrl}" DEFAULT_PATH_ID="${pathId}" uv run python -m src.main process`,
        {
          timeout: 600000, // 10 minute timeout (synthesis can take longer)
          maxBuffer: 1024 * 1024 * 10, // 10MB buffer
          env: {
            ...process.env,
            API_URL: apiUrl,
            DEFAULT_PATH_ID: pathId,
          },
        }
      );

      const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(1);

      if (stdout) {
        this.logger.log(`[SYNTHESIZE] Synthesizer stdout:\n${stdout}`);
      }
      if (stderr) {
        this.logger.warn(`[SYNTHESIZE] Synthesizer stderr:\n${stderr}`);
      }

      // Count knowledge units after synthesis
      const unitsAfter = await this.knowledgeUnitRepository.count({
        where: { pathId },
      });

      // Also count ALL knowledge units to check if they're being saved with wrong pathId
      const totalUnitsAfter = await this.knowledgeUnitRepository.count();
      this.logger.log(`[SYNTHESIZE] Total knowledge units in DB (all paths) after: ${totalUnitsAfter} (was ${totalUnits})`);

      const unitsGenerated = unitsAfter - unitsBefore;
      this.logger.log(`[SYNTHESIZE] Completed in ${elapsedSeconds}s! Knowledge units for this path: ${unitsAfter} (+${unitsGenerated} new)`);

      return {
        status: 'completed',
        message: `Successfully synthesized ${unitsGenerated} knowledge units from ${rawContentCount} raw content items`,
        rawContentProcessed: rawContentCount,
        knowledgeUnitsGenerated: unitsGenerated,
      };
    } catch (error: any) {
      const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(1);
      const errorMessage = error.stderr || error.message || 'Unknown error';
      this.logger.error(`[SYNTHESIZE] Failed after ${elapsedSeconds}s: ${errorMessage}`);
      if (error.stdout) {
        this.logger.error(`[SYNTHESIZE] stdout before failure:\n${error.stdout}`);
      }
      if (error.killed) {
        this.logger.error(`[SYNTHESIZE] Process was killed (likely timeout)`);
      }
      throw new BadRequestException(`Synthesis failed: ${errorMessage}`);
    }
  }

  /**
   * Decompose a concept into sub-concepts using AI
   * @param conceptId - The concept ID to decompose
   * @returns The generated sub-concepts
   */
  async decomposeIntoSubConcepts(conceptId: string): Promise<{
    subConcepts: SubConcept[];
    message: string;
  }> {
    if (!this.anthropic) {
      throw new BadRequestException(
        'AI generation is not available. Please configure ANTHROPIC_API_KEY in .env'
      );
    }

    // Fetch the concept with its learning path
    const concept = await this.conceptRepository.findOne({
      where: { id: conceptId },
      relations: ['learningPath'],
    });

    if (!concept) {
      throw new NotFoundException(`Concept ${conceptId} not found`);
    }

    // Check if sub-concepts already exist
    const existingSubConcepts = await this.subConceptRepository.find({
      where: { conceptId },
    });

    if (existingSubConcepts.length > 0) {
      throw new BadRequestException(
        `Concept already has ${existingSubConcepts.length} sub-concepts. Delete them first to regenerate.`
      );
    }

    // Get domain from learning path
    const domain = concept.learningPath?.domain || 'general';

    // Generate sub-concepts using Claude
    const prompt = DECOMPOSE_CONCEPT_PROMPT
      .replace('{name}', concept.name)
      .replace('{description}', concept.description)
      .replace('{difficulty}', concept.difficulty)
      .replace('{domain}', domain);

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new BadRequestException('Unexpected response type from Claude API');
    }

    // Parse JSON (handle potential markdown wrapping)
    let jsonText = content.text.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```json\n?|\n?```/g, '');
    }

    let generatedData: { subConcepts: Array<{ name: string; description: string; order: number }> };
    try {
      generatedData = JSON.parse(jsonText);
      if (!generatedData.subConcepts || !Array.isArray(generatedData.subConcepts)) {
        throw new Error('Invalid response structure');
      }
    } catch (error) {
      throw new BadRequestException(
        `Failed to parse AI response: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    // Save sub-concepts
    const savedSubConcepts: SubConcept[] = [];
    for (const subConceptData of generatedData.subConcepts) {
      const subConcept = this.subConceptRepository.create({
        conceptId,
        name: subConceptData.name,
        description: subConceptData.description,
        order: subConceptData.order || 0,
      });
      const saved = await this.subConceptRepository.save(subConcept);
      savedSubConcepts.push(saved);
    }

    return {
      subConcepts: savedSubConcepts,
      message: `Successfully generated ${savedSubConcepts.length} sub-concepts for "${concept.name}"`,
    };
  }

  /**
   * Generate structured knowledge units for a sub-concept using AI
   * @param subConceptId - The sub-concept ID to generate KUs for
   * @returns The generated knowledge units (3-5 per sub-concept)
   */
  async generateStructuredKU(subConceptId: string): Promise<{
    knowledgeUnits: KnowledgeUnit[];
    message: string;
  }> {
    if (!this.anthropic) {
      throw new BadRequestException(
        'AI generation is not available. Please configure ANTHROPIC_API_KEY in .env'
      );
    }

    // Fetch the sub-concept with its concept and learning path
    const subConcept = await this.subConceptRepository.findOne({
      where: { id: subConceptId },
      relations: ['concept', 'concept.learningPath'],
    });

    if (!subConcept) {
      throw new NotFoundException(`SubConcept ${subConceptId} not found`);
    }

    const parentConcept = subConcept.concept;
    const learningPath = parentConcept?.learningPath;
    const domain = learningPath?.domain || 'general';

    // Generate structured KUs using Claude
    const prompt = GENERATE_STRUCTURED_KU_PROMPT
      .replace('{subConceptName}', subConcept.name)
      .replace('{subConceptDescription}', subConcept.description)
      .replace('{conceptName}', parentConcept?.name || 'Unknown')
      .replace('{domain}', domain);

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new BadRequestException('Unexpected response type from Claude API');
    }

    // Parse JSON (handle potential markdown wrapping)
    let jsonText = content.text.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```json\n?|\n?```/g, '');
    }

    let kuDataArray: {
      knowledgeUnits: Array<{
        concept: string;
        question: string;
        answer: string;
        elaboration: string;
        examples: string[];
        analogies: string[];
        commonMistakes: string[];
        difficulty: string;
        cognitiveLevel: string;
        tags: string[];
      }>;
    };

    try {
      kuDataArray = JSON.parse(jsonText);
      if (!kuDataArray.knowledgeUnits || !Array.isArray(kuDataArray.knowledgeUnits)) {
        throw new Error('Invalid response structure - missing knowledgeUnits array');
      }
      if (kuDataArray.knowledgeUnits.length === 0) {
        throw new Error('No knowledge units generated');
      }
    } catch (error) {
      throw new BadRequestException(
        `Failed to parse AI response: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    // Create and save all knowledge units
    const savedKnowledgeUnits: KnowledgeUnit[] = [];

    for (const kuData of kuDataArray.knowledgeUnits) {
      if (!kuData.concept || !kuData.question || !kuData.answer) {
        this.logger.warn(`Skipping invalid KU: missing required fields`);
        continue;
      }

      const knowledgeUnit = this.knowledgeUnitRepository.create({
        pathId: learningPath?.id || '',
        conceptId: parentConcept?.id,
        subConceptId: subConcept.id,
        type: 'structured',
        concept: kuData.concept,
        question: kuData.question,
        answer: kuData.answer,
        elaboration: kuData.elaboration || '',
        examples: kuData.examples || [],
        analogies: kuData.analogies || [],
        commonMistakes: kuData.commonMistakes || [],
        difficulty: kuData.difficulty || 'intermediate',
        cognitiveLevel: kuData.cognitiveLevel || 'understand',
        tags: kuData.tags || [],
        sourceIds: [],
        status: 'approved',
      });

      const saved = await this.knowledgeUnitRepository.save(knowledgeUnit);
      savedKnowledgeUnits.push(saved);
    }

    return {
      knowledgeUnits: savedKnowledgeUnits,
      message: `Successfully generated ${savedKnowledgeUnits.length} knowledge units for "${subConcept.name}"`,
    };
  }
}
