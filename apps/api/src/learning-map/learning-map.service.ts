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
} from '@kasita/common-models';
import { LearningPath } from '../learning-paths/entities/learning-path.entity';
import { NotebookProgress } from '../notebooks/entities/notebook-progress.entity';

@Injectable()
export class LearningMapService {
  constructor(
    @InjectRepository(LearningPath)
    private readonly learningPathRepository: Repository<LearningPath>,
    @InjectRepository(NotebookProgress)
    private readonly notebookProgressRepository: Repository<NotebookProgress>,
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
}
