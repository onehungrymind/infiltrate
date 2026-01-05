import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SourceConfigsService } from './source-configs.service';
import { CreateSourceConfigDto } from './dto/create-source-config.dto';
import { UpdateSourceConfigDto } from './dto/update-source-config.dto';

@Controller('source-configs')
export class SourceConfigsController {
  constructor(private readonly sourceConfigsService: SourceConfigsService) {}

  @Post()
  create(@Body() createSourceConfigDto: CreateSourceConfigDto) {
    return this.sourceConfigsService.create(createSourceConfigDto);
  }

  @Get()
  findAll() {
    return this.sourceConfigsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sourceConfigsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSourceConfigDto: UpdateSourceConfigDto) {
    return this.sourceConfigsService.update(id, updateSourceConfigDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sourceConfigsService.remove(id);
  }
}
