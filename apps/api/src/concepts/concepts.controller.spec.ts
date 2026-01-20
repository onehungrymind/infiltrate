import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { CreateConceptDto } from './dto/create-concept.dto';
import { UpdateConceptDto } from './dto/update-concept.dto';
import { Concept } from './entities/concept.entity';
import { ConceptsController } from './concepts.controller';
import { ConceptsService } from './concepts.service';

describe('ConceptsController', () => {
  let controller: ConceptsController;
  let service: jest.Mocked<ConceptsService>;

  const mockConcept: Partial<Concept> = {
    id: 'concept-1',
    pathId: 'path-1',
    name: 'Server Components Fundamentals',
    description: 'Understanding the core concepts of React Server Components',
    estimatedHours: 2,
    difficulty: 'foundational',
    prerequisites: [],
    order: 0,
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockConceptsList: Partial<Concept>[] = [
    mockConcept,
    {
      id: 'concept-2',
      pathId: 'path-1',
      name: 'Streaming & Suspense',
      description: 'Learn how Server Components enable streaming SSR',
      estimatedHours: 3,
      difficulty: 'intermediate',
      prerequisites: ['concept-1'],
      order: 1,
      status: 'pending',
    },
  ];

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByPath: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConceptsController],
      providers: [
        {
          provide: ConceptsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ConceptsController>(ConceptsController);
    service = module.get(ConceptsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new concept', async () => {
      const createDto: CreateConceptDto = {
        pathId: 'path-1',
        name: 'Server Components Fundamentals',
        description: 'Understanding the core concepts',
      };

      service.create.mockResolvedValue(mockConcept as Concept);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockConcept);
    });

    it('should create a concept with optional fields', async () => {
      const createDto: CreateConceptDto = {
        pathId: 'path-1',
        name: 'Advanced Patterns',
        description: 'Advanced patterns for RSC',
        estimatedHours: 5,
        difficulty: 'advanced',
        prerequisites: ['concept-1'],
        order: 2,
      };

      const advancedConcept = { ...mockConcept, ...createDto };
      service.create.mockResolvedValue(advancedConcept as Concept);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(advancedConcept);
    });
  });

  describe('findAll', () => {
    it('should return all concepts', async () => {
      service.findAll.mockResolvedValue(mockConceptsList as Concept[]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockConceptsList);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no concepts exist', async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a single concept by id', async () => {
      service.findOne.mockResolvedValue(mockConcept as Concept);

      const result = await controller.findOne('concept-1');

      expect(service.findOne).toHaveBeenCalledWith('concept-1');
      expect(result).toEqual(mockConcept);
    });

    it('should throw NotFoundException when concept not found', async () => {
      service.findOne.mockRejectedValue(
        new NotFoundException('Concept with ID non-existent not found'),
      );

      await expect(controller.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByPath', () => {
    it('should return concepts for a specific path', async () => {
      service.findByPath.mockResolvedValue(mockConceptsList as Concept[]);

      const result = await controller.findByPath('path-1');

      expect(service.findByPath).toHaveBeenCalledWith('path-1');
      expect(result).toEqual(mockConceptsList);
    });

    it('should return empty array when path has no concepts', async () => {
      service.findByPath.mockResolvedValue([]);

      const result = await controller.findByPath('empty-path');

      expect(service.findByPath).toHaveBeenCalledWith('empty-path');
      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update a concept', async () => {
      const updateDto: UpdateConceptDto = {
        name: 'Updated Name',
        status: 'in_progress',
      };
      const updatedConcept = { ...mockConcept, ...updateDto };

      service.update.mockResolvedValue(updatedConcept as Concept);

      const result = await controller.update('concept-1', updateDto);

      expect(service.update).toHaveBeenCalledWith('concept-1', updateDto);
      expect(result.name).toBe('Updated Name');
      expect(result.status).toBe('in_progress');
    });

    it('should throw NotFoundException when updating non-existent concept', async () => {
      const updateDto: UpdateConceptDto = { name: 'Test' };

      service.update.mockRejectedValue(
        new NotFoundException('Concept with ID non-existent not found'),
      );

      await expect(controller.update('non-existent', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a concept', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove('concept-1');

      expect(service.remove).toHaveBeenCalledWith('concept-1');
    });

    it('should throw NotFoundException when removing non-existent concept', async () => {
      service.remove.mockRejectedValue(
        new NotFoundException('Concept with ID non-existent not found'),
      );

      await expect(controller.remove('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
