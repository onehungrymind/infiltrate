import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { KnowledgeUnitsService } from './knowledge-units.service';
import { CreateKnowledgeUnitDto } from './dto/create-knowledge-unit.dto';
import { UpdateKnowledgeUnitDto } from './dto/update-knowledge-unit.dto';

@Controller('knowledge-units')
export class KnowledgeUnitsController {
  constructor(private readonly knowledgeUnitsService: KnowledgeUnitsService) {}

  @Post()
  create(@Body() createKnowledgeUnitDto: CreateKnowledgeUnitDto) {
    return this.knowledgeUnitsService.create(createKnowledgeUnitDto);
  }

  @Get()
  findAll() {
    return this.knowledgeUnitsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.knowledgeUnitsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateKnowledgeUnitDto: UpdateKnowledgeUnitDto) {
    return this.knowledgeUnitsService.update(id, updateKnowledgeUnitDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.knowledgeUnitsService.remove(id);
  }
}
