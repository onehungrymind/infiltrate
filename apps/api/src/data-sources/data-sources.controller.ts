import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation,ApiTags } from '@nestjs/swagger';

import { DataSourcesService } from './data-sources.service';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';

@ApiTags('data-sources')
@Controller('data-sources')
export class DataSourcesController {
  constructor(private readonly dataSourcesService: DataSourcesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new data source' })
  create(@Body() createDataSourceDto: CreateDataSourceDto) {
    return this.dataSourcesService.create(createDataSourceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all data sources' })
  findAll(@Query('enabled') enabled?: string) {
    const enabledBool = enabled === 'true' ? true : enabled === 'false' ? false : undefined;
    return this.dataSourcesService.findAll(enabledBool);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a data source by ID' })
  findOne(@Param('id') id: string) {
    return this.dataSourcesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a data source' })
  update(@Param('id') id: string, @Body() updateDataSourceDto: UpdateDataSourceDto) {
    return this.dataSourcesService.update(id, updateDataSourceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a data source' })
  remove(@Param('id') id: string) {
    return this.dataSourcesService.remove(id);
  }
}

