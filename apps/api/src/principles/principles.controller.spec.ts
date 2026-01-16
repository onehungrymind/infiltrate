import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { CreatePrincipleDto } from './dto/create-principle.dto';
import { UpdatePrincipleDto } from './dto/update-principle.dto';
import { Principle } from './entities/principle.entity';
import { PrinciplesController } from './principles.controller';
import { PrinciplesService } from './principles.service';

describe('PrinciplesController', () => {
  let controller: PrinciplesController;
  let service: jest.Mocked<PrinciplesService>;

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

  const mockPrinciplesList: Partial<Principle>[] = [
    mockPrinciple,
    {
      id: 'principle-2',
      pathId: 'path-1',
      name: 'Streaming & Suspense',
      description: 'Learn how Server Components enable streaming SSR',
      estimatedHours: 3,
      difficulty: 'intermediate',
      prerequisites: ['principle-1'],
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
      controllers: [PrinciplesController],
      providers: [
        {
          provide: PrinciplesService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<PrinciplesController>(PrinciplesController);
    service = module.get(PrinciplesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new principle', async () => {
      const createDto: CreatePrincipleDto = {
        pathId: 'path-1',
        name: 'Server Components Fundamentals',
        description: 'Understanding the core concepts',
      };

      service.create.mockResolvedValue(mockPrinciple as Principle);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockPrinciple);
    });

    it('should create a principle with optional fields', async () => {
      const createDto: CreatePrincipleDto = {
        pathId: 'path-1',
        name: 'Advanced Patterns',
        description: 'Advanced patterns for RSC',
        estimatedHours: 5,
        difficulty: 'advanced',
        prerequisites: ['principle-1'],
        order: 2,
      };

      const advancedPrinciple = { ...mockPrinciple, ...createDto };
      service.create.mockResolvedValue(advancedPrinciple as Principle);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(advancedPrinciple);
    });
  });

  describe('findAll', () => {
    it('should return all principles', async () => {
      service.findAll.mockResolvedValue(mockPrinciplesList as Principle[]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockPrinciplesList);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no principles exist', async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a single principle by id', async () => {
      service.findOne.mockResolvedValue(mockPrinciple as Principle);

      const result = await controller.findOne('principle-1');

      expect(service.findOne).toHaveBeenCalledWith('principle-1');
      expect(result).toEqual(mockPrinciple);
    });

    it('should throw NotFoundException when principle not found', async () => {
      service.findOne.mockRejectedValue(
        new NotFoundException('Principle with ID non-existent not found'),
      );

      await expect(controller.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByPath', () => {
    it('should return principles for a specific path', async () => {
      service.findByPath.mockResolvedValue(mockPrinciplesList as Principle[]);

      const result = await controller.findByPath('path-1');

      expect(service.findByPath).toHaveBeenCalledWith('path-1');
      expect(result).toEqual(mockPrinciplesList);
    });

    it('should return empty array when path has no principles', async () => {
      service.findByPath.mockResolvedValue([]);

      const result = await controller.findByPath('empty-path');

      expect(service.findByPath).toHaveBeenCalledWith('empty-path');
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

      service.update.mockResolvedValue(updatedPrinciple as Principle);

      const result = await controller.update('principle-1', updateDto);

      expect(service.update).toHaveBeenCalledWith('principle-1', updateDto);
      expect(result.name).toBe('Updated Name');
      expect(result.status).toBe('in_progress');
    });

    it('should throw NotFoundException when updating non-existent principle', async () => {
      const updateDto: UpdatePrincipleDto = { name: 'Test' };

      service.update.mockRejectedValue(
        new NotFoundException('Principle with ID non-existent not found'),
      );

      await expect(controller.update('non-existent', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a principle', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove('principle-1');

      expect(service.remove).toHaveBeenCalledWith('principle-1');
    });

    it('should throw NotFoundException when removing non-existent principle', async () => {
      service.remove.mockRejectedValue(
        new NotFoundException('Principle with ID non-existent not found'),
      );

      await expect(controller.remove('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
