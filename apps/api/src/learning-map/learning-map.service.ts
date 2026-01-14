import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
  constructor(
    @InjectRepository(LearningPath)
    private readonly learningPathRepository: Repository<LearningPath>,
    @InjectRepository(NotebookProgress)
    private readonly notebookProgressRepository: Repository<NotebookProgress>,
    @InjectRepository(Principle)
    private readonly principleRepository: Repository<Principle>,
    @InjectRepository(KnowledgeUnit)
    private readonly knowledgeUnitRepository: Repository<KnowledgeUnit>,
  ) {}

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
}
