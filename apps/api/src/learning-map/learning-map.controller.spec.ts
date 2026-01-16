import { LearningMapEdge, LearningMapNode, LearningPathMap } from '@kasita/common-models';
import { ExecutionContext, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LearningMapController } from './learning-map.controller';
import { LearningMapService } from './learning-map.service';

describe('LearningMapController', () => {
  let controller: LearningMapController;
  let service: jest.Mocked<LearningMapService>;

  const mockLearningPathMap: LearningPathMap = {
    id: 'principle-map-path-1',
    outcomeId: 'path-1',
    nodes: [
      {
        id: 'principle-1',
        type: 'principle',
        label: 'Server Components Fundamentals',
        status: 'not-started',
        position: { x: 0, y: 0 },
        data: {
          title: 'Server Components Fundamentals',
          description: 'Understanding the core concepts of React Server Components',
          difficulty: 'foundational',
          estimatedHours: 2,
          prerequisites: [],
          order: 0,
        },
      },
    ] as LearningMapNode[],
    edges: [] as LearningMapEdge[],
    metadata: {
      totalNodes: 1,
      completedNodes: 0,
      estimatedTime: 2,
      progress: 0,
    },
  };

  const mockLearningMapProgress = {
    userId: 'user-1',
    pathId: 'path-1',
    nodeProgress: {},
    lastUpdated: new Date(),
  };

  const mockNodeDetails = {
    node: mockLearningPathMap.nodes[0],
    progress: {
      nodeId: 'principle-1',
      status: 'in-progress' as const,
      startedAt: new Date(),
    },
    prerequisites: [],
    unlocks: [],
  };

  const mockLearningPaths = [
    { id: 'path-1', name: 'React Server Components', domain: 'Web Dev', principleCount: 4 },
    { id: 'path-2', name: 'Machine Learning', domain: 'Data Science', principleCount: 3 },
  ];

  const mockRequest = {
    user: { userId: 'user-1' },
  };

  beforeEach(async () => {
    const mockService = {
      getLearningPath: jest.fn(),
      getUserProgress: jest.fn(),
      getNodeDetails: jest.fn(),
      updateNodeStatus: jest.fn(),
      unlockNode: jest.fn(),
      recordNodeCompletion: jest.fn(),
      getEstimatedTimeToCompletion: jest.fn(),
      getPrincipleMap: jest.fn(),
      getLearningPathsForMap: jest.fn(),
    };

    // Mock the JwtAuthGuard to always allow requests
    const mockJwtAuthGuard = {
      canActivate: (context: ExecutionContext) => true,
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LearningMapController],
      providers: [
        {
          provide: LearningMapService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<LearningMapController>(LearningMapController);
    service = module.get(LearningMapService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getLearningPath', () => {
    it('should return a learning path map', async () => {
      service.getLearningPath.mockResolvedValue(mockLearningPathMap);

      const result = await controller.getLearningPath('outcome-1', 'user-1', mockRequest);

      expect(service.getLearningPath).toHaveBeenCalledWith('user-1', 'outcome-1');
      expect(result).toEqual(mockLearningPathMap);
    });

    it('should use userId from JWT token', async () => {
      service.getLearningPath.mockResolvedValue(mockLearningPathMap);

      await controller.getLearningPath('outcome-1', 'ignored-user', mockRequest);

      expect(service.getLearningPath).toHaveBeenCalledWith('user-1', 'outcome-1');
    });
  });

  describe('getUserProgress', () => {
    it('should return user progress for a path', async () => {
      service.getUserProgress.mockResolvedValue(mockLearningMapProgress);

      const result = await controller.getUserProgress('path-1', 'user-1', mockRequest);

      expect(service.getUserProgress).toHaveBeenCalledWith('user-1', 'path-1');
      expect(result).toEqual(mockLearningMapProgress);
    });
  });

  describe('getNodeDetails', () => {
    it('should return node details', async () => {
      service.getNodeDetails.mockResolvedValue(mockNodeDetails);

      const result = await controller.getNodeDetails('principle-1');

      expect(service.getNodeDetails).toHaveBeenCalledWith('principle-1');
      expect(result).toEqual(mockNodeDetails);
    });
  });

  describe('updateNodeStatus', () => {
    it('should update node status', async () => {
      service.updateNodeStatus.mockResolvedValue(undefined);

      await controller.updateNodeStatus('principle-1', {
        status: 'in-progress',
      });

      expect(service.updateNodeStatus).toHaveBeenCalledWith('principle-1', 'in-progress', undefined);
    });

    it('should update node status with metrics', async () => {
      const metrics = { timeSpent: 30, score: 85 };
      service.updateNodeStatus.mockResolvedValue(undefined);

      await controller.updateNodeStatus('principle-1', {
        status: 'completed',
        metrics,
      });

      expect(service.updateNodeStatus).toHaveBeenCalledWith('principle-1', 'completed', metrics);
    });
  });

  describe('unlockNode', () => {
    it('should unlock a node', async () => {
      service.unlockNode.mockResolvedValue(undefined);

      await controller.unlockNode('principle-1');

      expect(service.unlockNode).toHaveBeenCalledWith('principle-1');
    });
  });

  describe('recordNodeCompletion', () => {
    it('should record node completion', async () => {
      const metrics = { score: 95, timeSpent: 45 };
      service.recordNodeCompletion.mockResolvedValue(undefined);

      await controller.recordNodeCompletion('principle-1', { metrics });

      expect(service.recordNodeCompletion).toHaveBeenCalledWith('principle-1', metrics);
    });
  });

  describe('getEstimatedTimeToCompletion', () => {
    it('should return time estimate', async () => {
      const timeEstimate = { hours: 10, days: 2 };
      service.getEstimatedTimeToCompletion.mockResolvedValue(timeEstimate);

      const result = await controller.getEstimatedTimeToCompletion('outcome-1');

      expect(service.getEstimatedTimeToCompletion).toHaveBeenCalledWith('outcome-1');
      expect(result).toEqual(timeEstimate);
    });
  });

  describe('getPrincipleMap', () => {
    it('should return a principle-based map', async () => {
      service.getPrincipleMap.mockResolvedValue(mockLearningPathMap);

      const result = await controller.getPrincipleMap('path-1');

      expect(service.getPrincipleMap).toHaveBeenCalledWith('path-1');
      expect(result).toEqual(mockLearningPathMap);
      expect(result.id).toBe('principle-map-path-1');
    });

    it('should throw NotFoundException if path not found', async () => {
      service.getPrincipleMap.mockRejectedValue(
        new NotFoundException('Learning path with ID non-existent not found'),
      );

      await expect(controller.getPrincipleMap('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getLearningPathsForMap', () => {
    it('should return learning paths with principle counts', async () => {
      service.getLearningPathsForMap.mockResolvedValue(mockLearningPaths);

      const result = await controller.getLearningPathsForMap();

      expect(service.getLearningPathsForMap).toHaveBeenCalled();
      expect(result).toEqual(mockLearningPaths);
      expect(result).toHaveLength(2);
      expect(result[0].principleCount).toBe(4);
    });

    it('should return empty array if no paths exist', async () => {
      service.getLearningPathsForMap.mockResolvedValue([]);

      const result = await controller.getLearningPathsForMap();

      expect(result).toEqual([]);
    });
  });
});
