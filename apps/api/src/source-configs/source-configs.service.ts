import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSourceConfigDto } from './dto/create-source-config.dto';
import { UpdateSourceConfigDto } from './dto/update-source-config.dto';
import { SourceConfig } from './entities/source-config.entity';

@Injectable()
export class SourceConfigsService {
  constructor(
    @InjectRepository(SourceConfig)
    private readonly sourceConfigRepository: Repository<SourceConfig>,
  ) {}

  async create(createSourceConfigDto: CreateSourceConfigDto): Promise<SourceConfig> {
    const sourceConfig = this.sourceConfigRepository.create({
      ...createSourceConfigDto,
      enabled: createSourceConfigDto.enabled ?? true,
    });
    return await this.sourceConfigRepository.save(sourceConfig);
  }

  async findAll(): Promise<SourceConfig[]> {
    return await this.sourceConfigRepository.find();
  }

  async findOne(id: string): Promise<SourceConfig> {
    const sourceConfig = await this.sourceConfigRepository.findOne({ where: { id } });
    if (!sourceConfig) {
      throw new NotFoundException(`Source config with ID ${id} not found`);
    }
    return sourceConfig;
  }

  async update(id: string, updateSourceConfigDto: UpdateSourceConfigDto): Promise<SourceConfig> {
    const sourceConfig = await this.findOne(id);
    Object.assign(sourceConfig, updateSourceConfigDto);
    return await this.sourceConfigRepository.save(sourceConfig);
  }

  async remove(id: string): Promise<void> {
    const sourceConfig = await this.findOne(id);
    await this.sourceConfigRepository.remove(sourceConfig);
  }
}
