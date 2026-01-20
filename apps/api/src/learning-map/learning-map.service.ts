import Anthropic from '@anthropic-ai/sdk';
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { exec } from 'child_process';
import { Repository } from 'typeorm';
import { promisify } from 'util';

import { DECOMPOSE_PRINCIPLE_PROMPT } from './prompts/decompose-principle.prompt';
import { GENERATE_PRINCIPLES_PROMPT } from './prompts/generate-principles.prompt';
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
  PrincipleNodeData,
} from '@kasita/common-models';

import { KnowledgeUnit } from '../knowledge-units/entities/knowledge-unit.entity';
import { LearningPath } from '../learning-paths/entities/learning-path.entity';
import { NotebookProgress } from '../notebooks/entities/notebook-progress.entity';
import { Principle } from '../principles/entities/principle.entity';
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
    @InjectRepository(Principle)
    private readonly principleRepository: Repository<Principle>,
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
  async getPrincipleMap(pathId: string): Promise<LearningPathMap> {
    // Fetch the learning path
    const learningPath = await this.learningPathRepository.findOne({
      where: { id: pathId },
    });

    if (!learningPath) {
      throw new NotFoundException(`Learning path ${pathId} not found`);
    }

    // Fetch all principles for this learning path
    const principles = await this.principleRepository.find({
      where: { pathId },
      order: { order: 'ASC' },
    });

    if (principles.length === 0) {
      throw new NotFoundException(`No principles found for learning path ${pathId}`);
    }

    // Count knowledge units per principle
    const knowledgeUnitCounts = await this.getKnowledgeUnitCounts(principles.map(p => p.id));

    // Convert principles to learning map nodes
    const nodes = this.convertPrinciplesToNodes(principles, knowledgeUnitCounts);

    // Generate edges from prerequisites
    const edges = this.generatePrerequisiteEdges(principles);

    // Calculate layout positions using hierarchical layout
    this.calculateHierarchicalLayout(nodes, principles);

    // Calculate metadata
    const completedNodes = nodes.filter(
      n => n.status === 'completed' || n.status === 'mastered'
    ).length;

    const totalEstimatedHours = principles.reduce(
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
    principleCount: number;
  }>> {
    const learningPaths = await this.learningPathRepository.find();

    const result = await Promise.all(
      learningPaths.map(async (path) => {
        const principleCount = await this.principleRepository.count({
          where: { pathId: path.id },
        });
        return {
          id: path.id,
          name: path.name,
          domain: path.domain,
          principleCount,
        };
      })
    );

    // Only return paths that have principles
    return result.filter(p => p.principleCount > 0);
  }

  /**
   * Get knowledge unit counts per principle
   */
  private async getKnowledgeUnitCounts(principleIds: string[]): Promise<Record<string, number>> {
    const counts: Record<string, number> = {};

    for (const principleId of principleIds) {
      const count = await this.knowledgeUnitRepository.count({
        where: { principleId },
      });
      counts[principleId] = count;
    }

    return counts;
  }

  /**
   * Convert Principle entities to LearningMapNode format
   */
  private convertPrinciplesToNodes(
    principles: Principle[],
    knowledgeUnitCounts: Record<string, number>,
  ): LearningMapNode[] {
    return principles.map((principle) => {
      // Map principle status to node status
      const statusMap: Record<string, NodeStatus> = {
        pending: 'not-started',
        in_progress: 'in-progress',
        mastered: 'completed',
      };

      const nodeData: PrincipleNodeData = {
        title: principle.name,
        description: principle.description,
        difficulty: principle.difficulty as 'foundational' | 'intermediate' | 'advanced',
        estimatedHours: principle.estimatedHours || 0,
        prerequisites: principle.prerequisites || [],
        order: principle.order || 0,
        knowledgeUnitCount: knowledgeUnitCounts[principle.id] || 0,
      };

      return {
        id: principle.id,
        type: 'principle' as const,
        label: principle.name,
        status: statusMap[principle.status] || 'not-started',
        position: { x: 0, y: 0 }, // Will be calculated by layout
        data: nodeData,
      };
    });
  }

  /**
   * Generate edges from principle prerequisites
   */
  private generatePrerequisiteEdges(principles: Principle[]): LearningMapEdge[] {
    const edges: LearningMapEdge[] = [];
    const principleIds = new Set(principles.map(p => p.id));

    for (const principle of principles) {
      if (principle.prerequisites && principle.prerequisites.length > 0) {
        for (const prereqId of principle.prerequisites) {
          // Only create edges for prerequisites that exist in this path
          if (principleIds.has(prereqId)) {
            edges.push({
              id: `edge-${prereqId}-${principle.id}`,
              source: prereqId,
              target: principle.id,
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
    principles: Principle[],
  ): void {
    // Group principles by difficulty level
    const difficultyOrder = ['foundational', 'intermediate', 'advanced'];
    const nodesByDifficulty: Record<string, LearningMapNode[]> = {
      foundational: [],
      intermediate: [],
      advanced: [],
    };

    for (const node of nodes) {
      const principle = principles.find(p => p.id === node.id);
      const difficulty = principle?.difficulty || 'foundational';
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
        const principleA = principles.find(p => p.id === a.id);
        const principleB = principles.find(p => p.id === b.id);
        return (principleA?.order || 0) - (principleB?.order || 0);
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
   * Generate principles for a learning path using AI
   * @param pathId - The learning path ID to generate principles for
   * @param force - If true, delete existing principles before generating new ones
   * @returns The generated principles and updated learning path map
   */
  async generatePrinciplesWithAI(pathId: string, force = false): Promise<{
    principles: Principle[];
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

    // Check if principles already exist
    const existingPrinciples = await this.principleRepository.find({
      where: { pathId },
    });

    if (existingPrinciples.length > 0) {
      if (force) {
        // First, unlink any knowledge units from these principles
        const principleIds = existingPrinciples.map(p => p.id);
        await this.knowledgeUnitRepository
          .createQueryBuilder()
          .update()
          .set({ principleId: null })
          .where('principleId IN (:...ids)', { ids: principleIds })
          .execute();

        // Then delete existing principles
        await this.principleRepository.remove(existingPrinciples);
      } else {
        throw new BadRequestException(
          `Learning path already has ${existingPrinciples.length} principles. Delete them first to regenerate.`
        );
      }
    }

    // Generate principles using Claude
    const generatedData = await this.generatePrinciplesFromClaude(
      learningPath.name,
      learningPath.domain,
      learningPath.targetSkill
    );

    // Create a map of temporary IDs to real UUIDs
    const idMap = new Map<string, string>();

    // First pass: create all principles to get their UUIDs
    const savedPrinciples: Principle[] = [];

    for (const principleData of generatedData.principles) {
      const principle = this.principleRepository.create({
        pathId,
        name: principleData.name,
        description: principleData.description,
        difficulty: principleData.difficulty,
        estimatedHours: principleData.estimatedHours || 1,
        prerequisites: [], // Will update in second pass
        order: principleData.order || 0,
        status: 'pending',
      });

      const saved = await this.principleRepository.save(principle);
      savedPrinciples.push(saved);
      idMap.set(principleData.id, saved.id);
    }

    // Second pass: update prerequisites with real UUIDs
    for (let i = 0; i < generatedData.principles.length; i++) {
      const principleData = generatedData.principles[i];
      const savedPrinciple = savedPrinciples[i];

      if (principleData.prerequisites && principleData.prerequisites.length > 0) {
        const realPrerequisites = principleData.prerequisites
          .map((prereqId: string) => idMap.get(prereqId))
          .filter((id: string | undefined): id is string => id !== undefined);

        savedPrinciple.prerequisites = realPrerequisites;
        await this.principleRepository.save(savedPrinciple);
      }
    }

    // Reload all principles with updated prerequisites
    const finalPrinciples = await this.principleRepository.find({
      where: { pathId },
      order: { order: 'ASC' },
    });

    return {
      principles: finalPrinciples,
      message: `Successfully generated ${finalPrinciples.length} principles for "${learningPath.name}"`,
    };
  }

  /**
   * Call Claude API to generate principles
   */
  private async generatePrinciplesFromClaude(
    name: string,
    domain: string,
    targetSkill: string
  ): Promise<{ principles: Array<{
    id: string;
    name: string;
    description: string;
    difficulty: string;
    estimatedHours: number;
    prerequisites: string[];
    order: number;
  }> }> {
    const prompt = GENERATE_PRINCIPLES_PROMPT
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
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```json\n?|\n?```/g, '');
    }

    try {
      const data = JSON.parse(jsonText);
      if (!data.principles || !Array.isArray(data.principles)) {
        throw new Error('Invalid response structure');
      }
      return data;
    } catch (error) {
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
   * Decompose a principle into sub-concepts using AI
   * @param principleId - The principle ID to decompose
   * @returns The generated sub-concepts
   */
  async decomposeIntoSubConcepts(principleId: string): Promise<{
    subConcepts: SubConcept[];
    message: string;
  }> {
    if (!this.anthropic) {
      throw new BadRequestException(
        'AI generation is not available. Please configure ANTHROPIC_API_KEY in .env'
      );
    }

    // Fetch the principle with its learning path
    const principle = await this.principleRepository.findOne({
      where: { id: principleId },
      relations: ['learningPath'],
    });

    if (!principle) {
      throw new NotFoundException(`Principle ${principleId} not found`);
    }

    // Check if sub-concepts already exist
    const existingSubConcepts = await this.subConceptRepository.find({
      where: { principleId },
    });

    if (existingSubConcepts.length > 0) {
      throw new BadRequestException(
        `Principle already has ${existingSubConcepts.length} sub-concepts. Delete them first to regenerate.`
      );
    }

    // Get domain from learning path
    const domain = principle.learningPath?.domain || 'general';

    // Generate sub-concepts using Claude
    const prompt = DECOMPOSE_PRINCIPLE_PROMPT
      .replace('{name}', principle.name)
      .replace('{description}', principle.description)
      .replace('{difficulty}', principle.difficulty)
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
        principleId,
        name: subConceptData.name,
        description: subConceptData.description,
        order: subConceptData.order || 0,
      });
      const saved = await this.subConceptRepository.save(subConcept);
      savedSubConcepts.push(saved);
    }

    return {
      subConcepts: savedSubConcepts,
      message: `Successfully generated ${savedSubConcepts.length} sub-concepts for "${principle.name}"`,
    };
  }

  /**
   * Generate a structured knowledge unit for a sub-concept using AI
   * @param subConceptId - The sub-concept ID to generate a KU for
   * @returns The generated knowledge unit
   */
  async generateStructuredKU(subConceptId: string): Promise<{
    knowledgeUnit: KnowledgeUnit;
    message: string;
  }> {
    if (!this.anthropic) {
      throw new BadRequestException(
        'AI generation is not available. Please configure ANTHROPIC_API_KEY in .env'
      );
    }

    // Fetch the sub-concept with its principle and learning path
    const subConcept = await this.subConceptRepository.findOne({
      where: { id: subConceptId },
      relations: ['principle', 'principle.learningPath'],
    });

    if (!subConcept) {
      throw new NotFoundException(`SubConcept ${subConceptId} not found`);
    }

    const principle = subConcept.principle;
    const learningPath = principle?.learningPath;
    const domain = learningPath?.domain || 'general';

    // Generate structured KU using Claude
    const prompt = GENERATE_STRUCTURED_KU_PROMPT
      .replace('{subConceptName}', subConcept.name)
      .replace('{subConceptDescription}', subConcept.description)
      .replace('{principleName}', principle?.name || 'Unknown')
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

    let kuData: {
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
    };

    try {
      kuData = JSON.parse(jsonText);
      if (!kuData.concept || !kuData.question || !kuData.answer) {
        throw new Error('Invalid response structure - missing required fields');
      }
    } catch (error) {
      throw new BadRequestException(
        `Failed to parse AI response: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    // Create the structured knowledge unit
    const knowledgeUnit = this.knowledgeUnitRepository.create({
      pathId: learningPath?.id || '',
      principleId: principle?.id,
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

    return {
      knowledgeUnit: saved,
      message: `Successfully generated structured knowledge unit for "${subConcept.name}"`,
    };
  }
}
