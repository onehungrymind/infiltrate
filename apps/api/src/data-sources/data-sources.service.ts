import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';
import { DataSource } from './entities/data-source.entity';

@Injectable()
export class DataSourcesService {
  constructor(
    @InjectRepository(DataSource)
    private dataSourcesRepository: Repository<DataSource>,
  ) {}

  create(createDataSourceDto: CreateDataSourceDto): Promise<DataSource> {
    const dataSource = this.dataSourcesRepository.create({
      ...createDataSourceDto,
      tags: createDataSourceDto.tags || [],
      enabled: createDataSourceDto.enabled ?? true,
    });
    return this.dataSourcesRepository.save(dataSource);
  }

  findAll(enabled?: boolean): Promise<DataSource[]> {
    if (enabled !== undefined) {
      return this.dataSourcesRepository.find({
        where: { enabled },
        order: { createdAt: 'DESC' },
      });
    }
    return this.dataSourcesRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  findOne(id: string): Promise<DataSource> {
    return this.dataSourcesRepository.findOne({ where: { id } }).then((dataSource) => {
      if (!dataSource) {
        throw new NotFoundException(`DataSource with ID ${id} not found`);
      }
      return dataSource;
    });
  }

  async update(id: string, updateDataSourceDto: UpdateDataSourceDto): Promise<DataSource> {
    const dataSource = await this.findOne(id);
    Object.assign(dataSource, updateDataSourceDto);
    return this.dataSourcesRepository.save(dataSource);
  }

  async remove(id: string): Promise<void> {
    const dataSource = await this.findOne(id);
    await this.dataSourcesRepository.remove(dataSource);
  }

  async updateLastIngestedAt(id: string): Promise<void> {
    await this.dataSourcesRepository.update(id, {
      lastIngestedAt: new Date(),
    });
  }
}

