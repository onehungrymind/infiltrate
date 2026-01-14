import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePrincipleDto } from './dto/create-principle.dto';
import { UpdatePrincipleDto } from './dto/update-principle.dto';
import { Principle } from './entities/principle.entity';

@Injectable()
export class PrinciplesService {
  constructor(
    @InjectRepository(Principle)
    private readonly principleRepository: Repository<Principle>,
  ) {}

  async create(createPrincipleDto: CreatePrincipleDto): Promise<Principle> {
    const principle = this.principleRepository.create({
      ...createPrincipleDto,
      prerequisites: createPrincipleDto.prerequisites || [],
      estimatedHours: createPrincipleDto.estimatedHours || 1,
      difficulty: createPrincipleDto.difficulty || 'foundational',
      order: createPrincipleDto.order || 0,
      status: 'pending',
    });
    return await this.principleRepository.save(principle);
  }

  async findAll(): Promise<Principle[]> {
    return await this.principleRepository.find({
      order: { order: 'ASC', createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Principle> {
    const principle = await this.principleRepository.findOne({ where: { id } });
    if (!principle) {
      throw new NotFoundException(`Principle with ID ${id} not found`);
    }
    return principle;
  }

  async findByPath(pathId: string): Promise<Principle[]> {
    return await this.principleRepository.find({
      where: { pathId },
      order: { order: 'ASC', createdAt: 'ASC' },
    });
  }

  async update(id: string, updatePrincipleDto: UpdatePrincipleDto): Promise<Principle> {
    const principle = await this.findOne(id);
    Object.assign(principle, updatePrincipleDto);
    return await this.principleRepository.save(principle);
  }

  async remove(id: string): Promise<void> {
    const principle = await this.findOne(id);
    await this.principleRepository.remove(principle);
  }
}
