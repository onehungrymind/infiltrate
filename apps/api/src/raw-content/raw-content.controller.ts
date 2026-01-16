import { Body, Controller, Delete,Get, Param, Patch, Post } from '@nestjs/common';

import { CreateRawContentDto } from './dto/create-raw-content.dto';
import { UpdateRawContentDto } from './dto/update-raw-content.dto';
import { RawContentService } from './raw-content.service';

@Controller('raw-content')
export class RawContentController {
  constructor(private readonly rawContentService: RawContentService) {}

  @Post()
  create(@Body() createRawContentDto: CreateRawContentDto) {
    return this.rawContentService.create(createRawContentDto);
  }

  @Get()
  findAll() {
    return this.rawContentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rawContentService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRawContentDto: UpdateRawContentDto) {
    return this.rawContentService.update(id, updateRawContentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rawContentService.remove(id);
  }
}
