import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateRawContentDto } from './dto/create-raw-content.dto';
import { UpdateRawContentDto } from './dto/update-raw-content.dto';
import { RawContent } from './entities/raw-content.entity';

@Injectable()
export class RawContentService {
  constructor(
    @InjectRepository(RawContent)
    private readonly rawContentRepository: Repository<RawContent>,
  ) {}

  async create(createRawContentDto: CreateRawContentDto): Promise<RawContent> {
    const rawContent = this.rawContentRepository.create({
      ...createRawContentDto,
      metadata: createRawContentDto.metadata || {},
    });
    return await this.rawContentRepository.save(rawContent);
  }

  async findAll(): Promise<RawContent[]> {
    return await this.rawContentRepository.find();
  }

  async findOne(id: string): Promise<RawContent> {
    const rawContent = await this.rawContentRepository.findOne({ where: { id } });
    if (!rawContent) {
      throw new NotFoundException(`Raw content with ID ${id} not found`);
    }
    return rawContent;
  }

  async update(id: string, updateRawContentDto: UpdateRawContentDto): Promise<RawContent> {
    const rawContent = await this.findOne(id);
    Object.assign(rawContent, updateRawContentDto);
    return await this.rawContentRepository.save(rawContent);
  }

  async remove(id: string): Promise<void> {
    const rawContent = await this.findOne(id);
    await this.rawContentRepository.remove(rawContent);
  }
}
