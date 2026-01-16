import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { KnowledgeUnit } from '../knowledge-units/entities/knowledge-unit.entity';
import { LearningPath } from '../learning-paths/entities/learning-path.entity';
import { NotebookProgress } from '../notebooks/entities/notebook-progress.entity';
import { Principle } from '../principles/entities/principle.entity';
import { LearningMapService } from './learning-map.service';

describe('LearningMapService', () => {
  let service: LearningMapService;
  let learningPathRepo: jest.Mocked<Repository<LearningPath>>;
  let principleRepo: jest.Mocked<Repository<Principle>>;
  let knowledgeUnitRepo: jest.Mocked<Repository<KnowledgeUnit>>;

  const mockLearningPath: Partial<LearningPath> = {
    id: 'path-1',
    name: 'React Server Components',
    domain: 'Web Development',
    targetSkill: 'Build production-ready RSC applications',
  };

  const mockPrinciples: Partial<Principle>[] = [
    {
      id: 'principle-1',
      pathId: 'path-1',
      name: 'Server Components Fundamentals',
      description: 'Understanding the core concepts of React Server Components',
      estimatedHours: 2,
      difficulty: 'foundational',
      prerequisites: [],
      order: 0,
      status: 'pending',
    },
    {
      id: 'principle-2',
      pathId: 'path-1',
      name: 'Streaming & Suspense',
      description: 'Learn how Server Components enable streaming SSR',
      estimatedHours: 3,
      difficulty: 'intermediate',
      prerequisites: ['principle-1'],
      order: 1,
      status: 'in_progress',
    },
    {
      id: 'principle-3',
      pathId: 'path-1',
      name: 'Server Actions',
      description: 'Implement form handling using Server Actions',
      estimatedHours: 3,
      difficulty: 'advanced',
      prerequisites: ['principle-1', 'principle-2'],
      order: 2,
      status: 'pending',
    },
  ];

  beforeEach(async () => {
    const mockLearningPathRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
    };

    const mockNotebookProgressRepo = {
      find: jest.fn(),
    };

    const mockPrincipleRepo = {
      find: jest.fn(),
      count: jest.fn(),
    };

    const mockKnowledgeUnitRepo = {
      count: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LearningMapService,
        {
          provide: getRepositoryToken(LearningPath),
          useValue: mockLearningPathRepo,
        },
        {
          provide: getRepositoryToken(NotebookProgress),
          useValue: mockNotebookProgressRepo,
        },
        {
          provide: getRepositoryToken(Principle),
          useValue: mockPrincipleRepo,
        },
        {
          provide: getRepositoryToken(KnowledgeUnit),
          useValue: mockKnowledgeUnitRepo,
        },
      ],
    }).compile();

    service = module.get<LearningMapService>(LearningMapService);
    learningPathRepo = module.get(getRepositoryToken(LearningPath));
    principleRepo = module.get(getRepositoryToken(Principle));
    knowledgeUnitRepo = module.get(getRepositoryToken(KnowledgeUnit));
  });

  describe('getPrincipleMap', () => {
    it('should return a principle-based learning map', async () => {
      learningPathRepo.findOne.mockResolvedValue(mockLearningPath as LearningPath);
      principleRepo.find.mockResolvedValue(mockPrinciples as Principle[]);
      knowledgeUnitRepo.count.mockResolvedValue(2);

      const result = await service.getPrincipleMap('path-1');

      expect(result).toBeDefined();
      expect(result.id).toBe('principle-map-path-1');
      expect(result.nodes).toHaveLength(3);
      expect(result.metadata.totalNodes).toBe(3);
    });

    it('should convert principles to nodes with correct types', async () => {
      learningPathRepo.findOne.mockResolvedValue(mockLearningPath as LearningPath);
      principleRepo.find.mockResolvedValue(mockPrinciples as Principle[]);
      knowledgeUnitRepo.count.mockResolvedValue(1);

      const result = await service.getPrincipleMap('path-1');

      // All nodes should be of type 'principle'
      result.nodes.forEach(node => {
        expect(node.type).toBe('principle');
      });

      // Check first node has correct data
      const firstNode = result.nodes.find(n => n.id === 'principle-1');
      expect(firstNode).toBeDefined();
      expect(firstNode?.label).toBe('Server Components Fundamentals');
      expect(firstNode?.status).toBe('not-started'); // 'pending' maps to 'not-started'
    });

    it('should generate prerequisite edges correctly', async () => {
      learningPathRepo.findOne.mockResolvedValue(mockLearningPath as LearningPath);
      principleRepo.find.mockResolvedValue(mockPrinciples as Principle[]);
      knowledgeUnitRepo.count.mockResolvedValue(0);

      const result = await service.getPrincipleMap('path-1');

      // principle-2 has principle-1 as prerequisite
      const edge1 = result.edges.find(e => e.source === 'principle-1' && e.target === 'principle-2');
      expect(edge1).toBeDefined();
      expect(edge1?.type).toBe('prerequisite');

      // principle-3 has both principle-1 and principle-2 as prerequisites
      const edge2 = result.edges.find(e => e.source === 'principle-1' && e.target === 'principle-3');
      const edge3 = result.edges.find(e => e.source === 'principle-2' && e.target === 'principle-3');
      expect(edge2).toBeDefined();
      expect(edge3).toBeDefined();
    });

    it('should throw NotFoundException if learning path does not exist', async () => {
      learningPathRepo.findOne.mockResolvedValue(null);

      await expect(service.getPrincipleMap('non-existent')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if no principles found', async () => {
      learningPathRepo.findOne.mockResolvedValue(mockLearningPath as LearningPath);
      principleRepo.find.mockResolvedValue([]);

      await expect(service.getPrincipleMap('path-1')).rejects.toThrow(NotFoundException);
    });

    it('should calculate layout positions based on difficulty', async () => {
      learningPathRepo.findOne.mockResolvedValue(mockLearningPath as LearningPath);
      principleRepo.find.mockResolvedValue(mockPrinciples as Principle[]);
      knowledgeUnitRepo.count.mockResolvedValue(0);

      const result = await service.getPrincipleMap('path-1');

      // Foundational nodes should be at top (lower y)
      const foundationalNode = result.nodes.find(n => n.id === 'principle-1');
      const intermediateNode = result.nodes.find(n => n.id === 'principle-2');
      const advancedNode = result.nodes.find(n => n.id === 'principle-3');

      expect(foundationalNode?.position.y).toBeLessThan(intermediateNode?.position.y || 0);
      expect(intermediateNode?.position.y).toBeLessThan(advancedNode?.position.y || 0);
    });

    it('should map principle status correctly', async () => {
      learningPathRepo.findOne.mockResolvedValue(mockLearningPath as LearningPath);
      principleRepo.find.mockResolvedValue(mockPrinciples as Principle[]);
      knowledgeUnitRepo.count.mockResolvedValue(0);

      const result = await service.getPrincipleMap('path-1');

      const pendingNode = result.nodes.find(n => n.id === 'principle-1');
      const inProgressNode = result.nodes.find(n => n.id === 'principle-2');

      expect(pendingNode?.status).toBe('not-started');
      expect(inProgressNode?.status).toBe('in-progress');
    });
  });

  describe('getLearningPathsForMap', () => {
    it('should return learning paths with principle counts', async () => {
      const mockPaths = [
        { id: 'path-1', name: 'React', domain: 'Web Dev' },
        { id: 'path-2', name: 'ML', domain: 'Data Science' },
      ];

      learningPathRepo.find.mockResolvedValue(mockPaths as LearningPath[]);
      principleRepo.count
        .mockResolvedValueOnce(4) // path-1 has 4 principles
        .mockResolvedValueOnce(3); // path-2 has 3 principles

      const result = await service.getLearningPathsForMap();

      expect(result).toHaveLength(2);
      expect(result[0].principleCount).toBe(4);
      expect(result[1].principleCount).toBe(3);
    });

    it('should filter out paths with no principles', async () => {
      const mockPaths = [
        { id: 'path-1', name: 'React', domain: 'Web Dev' },
        { id: 'path-2', name: 'Empty', domain: 'None' },
      ];

      learningPathRepo.find.mockResolvedValue(mockPaths as LearningPath[]);
      principleRepo.count
        .mockResolvedValueOnce(4) // path-1 has 4 principles
        .mockResolvedValueOnce(0); // path-2 has 0 principles

      const result = await service.getLearningPathsForMap();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('path-1');
    });

    it('should return empty array if no paths have principles', async () => {
      const mockPaths = [
        { id: 'path-1', name: 'Empty1', domain: 'None' },
        { id: 'path-2', name: 'Empty2', domain: 'None' },
      ];

      learningPathRepo.find.mockResolvedValue(mockPaths as LearningPath[]);
      principleRepo.count.mockResolvedValue(0);

      const result = await service.getLearningPathsForMap();

      expect(result).toHaveLength(0);
    });
  });
});
