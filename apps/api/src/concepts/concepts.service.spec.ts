import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateConceptDto } from './dto/create-concept.dto';
import { UpdateConceptDto } from './dto/update-concept.dto';
import { Concept } from './entities/concept.entity';
import { ConceptsService } from './concepts.service';

describe('ConceptsService', () => {
  let service: ConceptsService;
  let repository: jest.Mocked<Repository<Concept>>;

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

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConceptsService,
        {
          provide: getRepositoryToken(Concept),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ConceptsService>(ConceptsService);
    repository = module.get(getRepositoryToken(Concept));
  });

  describe('create', () => {
    it('should create a new concept', async () => {
      const createDto: CreateConceptDto = {
        pathId: 'path-1',
        name: 'Server Components Fundamentals',
        description: 'Understanding the core concepts',
      };

      repository.create.mockReturnValue(mockConcept as Concept);
      repository.save.mockResolvedValue(mockConcept as Concept);

      const result = await service.create(createDto);

      expect(repository.create).toHaveBeenCalledWith({
        ...createDto,
        prerequisites: [],
        estimatedHours: 1,
        difficulty: 'foundational',
        order: 0,
        status: 'pending',
      });
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(mockConcept);
    });

    it('should use provided optional values', async () => {
      const createDto: CreateConceptDto = {
        pathId: 'path-1',
        name: 'Advanced Patterns',
        description: 'Advanced patterns for RSC',
        estimatedHours: 5,
        difficulty: 'advanced',
        prerequisites: ['concept-1', 'concept-2'],
        order: 3,
      };

      repository.create.mockReturnValue({ ...mockConcept, ...createDto } as Concept);
      repository.save.mockResolvedValue({ ...mockConcept, ...createDto } as Concept);

      await service.create(createDto);

      expect(repository.create).toHaveBeenCalledWith({
        ...createDto,
        status: 'pending',
      });
    });
  });

  describe('findAll', () => {
    it('should return all concepts ordered by order and createdAt', async () => {
      const mockConcepts = [mockConcept, { ...mockConcept, id: 'concept-2' }];
      repository.find.mockResolvedValue(mockConcepts as Concept[]);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({
        order: { order: 'ASC', createdAt: 'ASC' },
      });
      expect(result).toEqual(mockConcepts);
    });
  });

  describe('findOne', () => {
    it('should return a concept by id', async () => {
      repository.findOne.mockResolvedValue(mockConcept as Concept);

      const result = await service.findOne('concept-1');

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 'concept-1' } });
      expect(result).toEqual(mockConcept);
    });

    it('should throw NotFoundException if concept not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('non-existent')).rejects.toThrow(
        'Concept with ID non-existent not found',
      );
    });
  });

  describe('findByPath', () => {
    it('should return concepts for a specific path', async () => {
      const mockConcepts = [
        mockConcept,
        { ...mockConcept, id: 'concept-2', order: 1 },
      ];
      repository.find.mockResolvedValue(mockConcepts as Concept[]);

      const result = await service.findByPath('path-1');

      expect(repository.find).toHaveBeenCalledWith({
        where: { pathId: 'path-1' },
        order: { order: 'ASC', createdAt: 'ASC' },
      });
      expect(result).toEqual(mockConcepts);
    });

    it('should return empty array if no concepts found for path', async () => {
      repository.find.mockResolvedValue([]);

      const result = await service.findByPath('empty-path');

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

      repository.findOne.mockResolvedValue(mockConcept as Concept);
      repository.save.mockResolvedValue(updatedConcept as Concept);

      const result = await service.update('concept-1', updateDto);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 'concept-1' } });
      expect(repository.save).toHaveBeenCalled();
      expect(result.name).toBe('Updated Name');
      expect(result.status).toBe('in_progress');
    });

    it('should throw NotFoundException if concept to update not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.update('non-existent', { name: 'Test' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a concept', async () => {
      repository.findOne.mockResolvedValue(mockConcept as Concept);
      repository.remove.mockResolvedValue(mockConcept as Concept);

      await service.remove('concept-1');

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 'concept-1' } });
      expect(repository.remove).toHaveBeenCalledWith(mockConcept);
    });

    it('should throw NotFoundException if concept to remove not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(NotFoundException);
    });
  });
});
