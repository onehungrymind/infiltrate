import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateKnowledgeUnitDto } from './dto/create-knowledge-unit.dto';
import { UpdateKnowledgeUnitDto } from './dto/update-knowledge-unit.dto';
import { KnowledgeUnit } from './entities/knowledge-unit.entity';

@Injectable()
export class KnowledgeUnitsService {
  constructor(
    @InjectRepository(KnowledgeUnit)
    private readonly knowledgeUnitRepository: Repository<KnowledgeUnit>,
  ) {}

  async create(createKnowledgeUnitDto: CreateKnowledgeUnitDto): Promise<KnowledgeUnit> {
    const knowledgeUnit = this.knowledgeUnitRepository.create({
      ...createKnowledgeUnitDto,
      examples: createKnowledgeUnitDto.examples || [],
      analogies: createKnowledgeUnitDto.analogies || [],
      commonMistakes: createKnowledgeUnitDto.commonMistakes || [],
      estimatedTimeSeconds: createKnowledgeUnitDto.estimatedTimeSeconds || 120,
      tags: createKnowledgeUnitDto.tags || [],
      sourceIds: createKnowledgeUnitDto.sourceIds || [],
      status: 'pending',
    });
    return await this.knowledgeUnitRepository.save(knowledgeUnit);
  }

  async findAll(): Promise<KnowledgeUnit[]> {
    return await this.knowledgeUnitRepository.find();
  }

  async findByPath(pathId: string): Promise<KnowledgeUnit[]> {
    return this.knowledgeUnitRepository.find({
      where: { pathId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<KnowledgeUnit> {
    const knowledgeUnit = await this.knowledgeUnitRepository.findOne({ where: { id } });
    if (!knowledgeUnit) {
      throw new NotFoundException(`Knowledge unit with ID ${id} not found`);
    }
    return knowledgeUnit;
  }

  async update(id: string, updateKnowledgeUnitDto: UpdateKnowledgeUnitDto): Promise<KnowledgeUnit> {
    const knowledgeUnit = await this.findOne(id);
    Object.assign(knowledgeUnit, updateKnowledgeUnitDto);
    return await this.knowledgeUnitRepository.save(knowledgeUnit);
  }

  async remove(id: string): Promise<void> {
    const knowledgeUnit = await this.findOne(id);
    await this.knowledgeUnitRepository.remove(knowledgeUnit);
  }
}
