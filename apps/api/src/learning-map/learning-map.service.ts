import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import Anthropic from '@anthropic-ai/sdk';
import { GENERATE_PRINCIPLES_PROMPT } from './prompts/generate-principles.prompt';
import {
  LearningPathMap,
  LearningMapProgress,
  LearningMapNode,
  LearningMapEdge,
  NodeDetails,
  NodeProgress,
  NodeStatus,
  PrincipleNodeData,
} from '@kasita/common-models';
import { LearningPath } from '../learning-paths/entities/learning-path.entity';
import { NotebookProgress } from '../notebooks/entities/notebook-progress.entity';
import { Principle } from '../principles/entities/principle.entity';
import { KnowledgeUnit } from '../knowledge-units/entities/knowledge-unit.entity';

@Injectable()
export class LearningMapService {
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
    private readonly configService: ConfigService,
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
}
