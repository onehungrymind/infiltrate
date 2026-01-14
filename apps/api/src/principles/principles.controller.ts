import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PrinciplesService } from './principles.service';
import { CreatePrincipleDto } from './dto/create-principle.dto';
import { UpdatePrincipleDto } from './dto/update-principle.dto';

@Controller('principles')
export class PrinciplesController {
  constructor(private readonly principlesService: PrinciplesService) {}

  @Post()
  create(@Body() createPrincipleDto: CreatePrincipleDto) {
    return this.principlesService.create(createPrincipleDto);
  }

  @Get()
  findAll() {
    return this.principlesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.principlesService.findOne(id);
  }

  @Get('path/:pathId')
  findByPath(@Param('pathId') pathId: string) {
    return this.principlesService.findByPath(pathId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePrincipleDto: UpdatePrincipleDto) {
    return this.principlesService.update(id, updatePrincipleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.principlesService.remove(id);
  }
}
