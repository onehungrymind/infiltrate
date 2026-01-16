import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreatePrincipleDto } from './dto/create-principle.dto';
import { UpdatePrincipleDto } from './dto/update-principle.dto';
import { Principle } from './entities/principle.entity';
import { PrinciplesService } from './principles.service';

describe('PrinciplesService', () => {
  let service: PrinciplesService;
  let repository: jest.Mocked<Repository<Principle>>;

  const mockPrinciple: Partial<Principle> = {
    id: 'principle-1',
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
        PrinciplesService,
        {
          provide: getRepositoryToken(Principle),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PrinciplesService>(PrinciplesService);
    repository = module.get(getRepositoryToken(Principle));
  });

  describe('create', () => {
    it('should create a new principle', async () => {
      const createDto: CreatePrincipleDto = {
        pathId: 'path-1',
        name: 'Server Components Fundamentals',
        description: 'Understanding the core concepts',
      };

      repository.create.mockReturnValue(mockPrinciple as Principle);
      repository.save.mockResolvedValue(mockPrinciple as Principle);

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
      expect(result).toEqual(mockPrinciple);
    });

    it('should use provided optional values', async () => {
      const createDto: CreatePrincipleDto = {
        pathId: 'path-1',
        name: 'Advanced Patterns',
        description: 'Advanced patterns for RSC',
        estimatedHours: 5,
        difficulty: 'advanced',
        prerequisites: ['principle-1', 'principle-2'],
        order: 3,
      };

      repository.create.mockReturnValue({ ...mockPrinciple, ...createDto } as Principle);
      repository.save.mockResolvedValue({ ...mockPrinciple, ...createDto } as Principle);

      await service.create(createDto);

      expect(repository.create).toHaveBeenCalledWith({
        ...createDto,
        status: 'pending',
      });
    });
  });

  describe('findAll', () => {
    it('should return all principles ordered by order and createdAt', async () => {
      const mockPrinciples = [mockPrinciple, { ...mockPrinciple, id: 'principle-2' }];
      repository.find.mockResolvedValue(mockPrinciples as Principle[]);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({
        order: { order: 'ASC', createdAt: 'ASC' },
      });
      expect(result).toEqual(mockPrinciples);
    });
  });

  describe('findOne', () => {
    it('should return a principle by id', async () => {
      repository.findOne.mockResolvedValue(mockPrinciple as Principle);

      const result = await service.findOne('principle-1');

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 'principle-1' } });
      expect(result).toEqual(mockPrinciple);
    });

    it('should throw NotFoundException if principle not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('non-existent')).rejects.toThrow(
        'Principle with ID non-existent not found',
      );
    });
  });

  describe('findByPath', () => {
    it('should return principles for a specific path', async () => {
      const mockPrinciples = [
        mockPrinciple,
        { ...mockPrinciple, id: 'principle-2', order: 1 },
      ];
      repository.find.mockResolvedValue(mockPrinciples as Principle[]);

      const result = await service.findByPath('path-1');

      expect(repository.find).toHaveBeenCalledWith({
        where: { pathId: 'path-1' },
        order: { order: 'ASC', createdAt: 'ASC' },
      });
      expect(result).toEqual(mockPrinciples);
    });

    it('should return empty array if no principles found for path', async () => {
      repository.find.mockResolvedValue([]);

      const result = await service.findByPath('empty-path');

      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update a principle', async () => {
      const updateDto: UpdatePrincipleDto = {
        name: 'Updated Name',
        status: 'in_progress',
      };
      const updatedPrinciple = { ...mockPrinciple, ...updateDto };

      repository.findOne.mockResolvedValue(mockPrinciple as Principle);
      repository.save.mockResolvedValue(updatedPrinciple as Principle);

      const result = await service.update('principle-1', updateDto);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 'principle-1' } });
      expect(repository.save).toHaveBeenCalled();
      expect(result.name).toBe('Updated Name');
      expect(result.status).toBe('in_progress');
    });

    it('should throw NotFoundException if principle to update not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.update('non-existent', { name: 'Test' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a principle', async () => {
      repository.findOne.mockResolvedValue(mockPrinciple as Principle);
      repository.remove.mockResolvedValue(mockPrinciple as Principle);

      await service.remove('principle-1');

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 'principle-1' } });
      expect(repository.remove).toHaveBeenCalledWith(mockPrinciple);
    });

    it('should throw NotFoundException if principle to remove not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(NotFoundException);
    });
  });
});
