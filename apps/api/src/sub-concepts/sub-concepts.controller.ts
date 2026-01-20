import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CreateSubConceptDto } from './dto/create-sub-concept.dto';
import { UpdateSubConceptDto } from './dto/update-sub-concept.dto';
import { SubConceptsService } from './sub-concepts.service';

@ApiTags('sub-concepts')
@Controller('sub-concepts')
export class SubConceptsController {
  constructor(private readonly subConceptsService: SubConceptsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new sub-concept' })
  @ApiResponse({ status: 201, description: 'Sub-concept created successfully' })
  create(@Body() createSubConceptDto: CreateSubConceptDto) {
    return this.subConceptsService.create(createSubConceptDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all sub-concepts' })
  @ApiResponse({ status: 200, description: 'List of all sub-concepts' })
  findAll() {
    return this.subConceptsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a sub-concept by ID' })
  @ApiResponse({ status: 200, description: 'Sub-concept found' })
  @ApiResponse({ status: 404, description: 'Sub-concept not found' })
  findOne(@Param('id') id: string) {
    return this.subConceptsService.findOne(id);
  }

  @Get('concept/:conceptId')
  @ApiOperation({ summary: 'Get all sub-concepts for a concept' })
  @ApiResponse({ status: 200, description: 'List of sub-concepts for the concept' })
  findByConcept(@Param('conceptId') conceptId: string) {
    return this.subConceptsService.findByConcept(conceptId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a sub-concept' })
  @ApiResponse({ status: 200, description: 'Sub-concept updated successfully' })
  @ApiResponse({ status: 404, description: 'Sub-concept not found' })
  update(@Param('id') id: string, @Body() updateSubConceptDto: UpdateSubConceptDto) {
    return this.subConceptsService.update(id, updateSubConceptDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a sub-concept' })
  @ApiResponse({ status: 200, description: 'Sub-concept deleted successfully' })
  @ApiResponse({ status: 404, description: 'Sub-concept not found' })
  remove(@Param('id') id: string) {
    return this.subConceptsService.remove(id);
  }

  // Decoration endpoints
  @Post(':id/decorations/:knowledgeUnitId')
  @ApiOperation({ summary: 'Add a discovered KU as decoration to a sub-concept' })
  @ApiResponse({ status: 201, description: 'Decoration added successfully' })
  addDecoration(
    @Param('id') subConceptId: string,
    @Param('knowledgeUnitId') knowledgeUnitId: string,
  ) {
    return this.subConceptsService.addDecoration(subConceptId, knowledgeUnitId);
  }

  @Delete(':id/decorations/:knowledgeUnitId')
  @ApiOperation({ summary: 'Remove a decoration from a sub-concept' })
  @ApiResponse({ status: 200, description: 'Decoration removed successfully' })
  removeDecoration(
    @Param('id') subConceptId: string,
    @Param('knowledgeUnitId') knowledgeUnitId: string,
  ) {
    return this.subConceptsService.removeDecoration(subConceptId, knowledgeUnitId);
  }

  @Get(':id/decorations')
  @ApiOperation({ summary: 'Get all decorations for a sub-concept' })
  @ApiResponse({ status: 200, description: 'List of decorations' })
  getDecorations(@Param('id') subConceptId: string) {
    return this.subConceptsService.getDecorations(subConceptId);
  }
}
