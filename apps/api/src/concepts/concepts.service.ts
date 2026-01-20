import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateConceptDto } from './dto/create-concept.dto';
import { UpdateConceptDto } from './dto/update-concept.dto';
import { Concept } from './entities/concept.entity';

@Injectable()
export class ConceptsService {
  constructor(
    @InjectRepository(Concept)
    private readonly conceptRepository: Repository<Concept>,
  ) {}

  async create(createConceptDto: CreateConceptDto): Promise<Concept> {
    const concept = this.conceptRepository.create({
      ...createConceptDto,
      prerequisites: createConceptDto.prerequisites || [],
      estimatedHours: createConceptDto.estimatedHours || 1,
      difficulty: createConceptDto.difficulty || 'foundational',
      order: createConceptDto.order || 0,
      status: 'pending',
    });
    return await this.conceptRepository.save(concept);
  }

  async findAll(): Promise<Concept[]> {
    return await this.conceptRepository.find({
      order: { order: 'ASC', createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Concept> {
    const concept = await this.conceptRepository.findOne({ where: { id } });
    if (!concept) {
      throw new NotFoundException(`Concept with ID ${id} not found`);
    }
    return concept;
  }

  async findByPath(pathId: string): Promise<Concept[]> {
    return await this.conceptRepository.find({
      where: { pathId },
      order: { order: 'ASC', createdAt: 'ASC' },
    });
  }

  async update(id: string, updateConceptDto: UpdateConceptDto): Promise<Concept> {
    const concept = await this.findOne(id);
    Object.assign(concept, updateConceptDto);
    return await this.conceptRepository.save(concept);
  }

  async remove(id: string): Promise<void> {
    const concept = await this.findOne(id);
    await this.conceptRepository.remove(concept);
  }
}
