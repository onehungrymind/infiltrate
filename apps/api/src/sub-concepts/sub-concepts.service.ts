import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateSubConceptDto } from './dto/create-sub-concept.dto';
import { UpdateSubConceptDto } from './dto/update-sub-concept.dto';
import { SubConcept } from './entities/sub-concept.entity';
import { SubConceptDecoration } from './entities/sub-concept-decoration.entity';

@Injectable()
export class SubConceptsService {
  constructor(
    @InjectRepository(SubConcept)
    private readonly subConceptRepository: Repository<SubConcept>,
    @InjectRepository(SubConceptDecoration)
    private readonly decorationRepository: Repository<SubConceptDecoration>,
  ) {}

  async create(createSubConceptDto: CreateSubConceptDto): Promise<SubConcept> {
    const subConcept = this.subConceptRepository.create({
      ...createSubConceptDto,
      order: createSubConceptDto.order || 0,
    });
    return await this.subConceptRepository.save(subConcept);
  }

  async findAll(): Promise<SubConcept[]> {
    return await this.subConceptRepository.find({
      order: { order: 'ASC', createdAt: 'ASC' },
      relations: ['knowledgeUnits', 'decorations'],
    });
  }

  async findOne(id: string): Promise<SubConcept> {
    const subConcept = await this.subConceptRepository.findOne({
      where: { id },
      relations: ['knowledgeUnits', 'decorations', 'decorations.knowledgeUnit'],
    });
    if (!subConcept) {
      throw new NotFoundException(`SubConcept with ID ${id} not found`);
    }
    return subConcept;
  }

  async findByPrinciple(principleId: string): Promise<SubConcept[]> {
    return await this.subConceptRepository.find({
      where: { principleId },
      order: { order: 'ASC', createdAt: 'ASC' },
      relations: ['knowledgeUnits', 'decorations'],
    });
  }

  async update(id: string, updateSubConceptDto: UpdateSubConceptDto): Promise<SubConcept> {
    const subConcept = await this.findOne(id);
    Object.assign(subConcept, updateSubConceptDto);
    return await this.subConceptRepository.save(subConcept);
  }

  async remove(id: string): Promise<void> {
    const subConcept = await this.findOne(id);
    await this.subConceptRepository.remove(subConcept);
  }

  // Decoration methods for attaching discovered KUs to sub-concepts
  async addDecoration(subConceptId: string, knowledgeUnitId: string): Promise<SubConceptDecoration> {
    // Check if decoration already exists
    const existing = await this.decorationRepository.findOne({
      where: { subConceptId, knowledgeUnitId },
    });
    if (existing) {
      return existing;
    }

    const decoration = this.decorationRepository.create({
      subConceptId,
      knowledgeUnitId,
    });
    return await this.decorationRepository.save(decoration);
  }

  async removeDecoration(subConceptId: string, knowledgeUnitId: string): Promise<void> {
    await this.decorationRepository.delete({ subConceptId, knowledgeUnitId });
  }

  async getDecorations(subConceptId: string): Promise<SubConceptDecoration[]> {
    return await this.decorationRepository.find({
      where: { subConceptId },
      relations: ['knowledgeUnit'],
    });
  }
}
