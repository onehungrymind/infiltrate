import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SourcesService } from './sources.service';
import { CreateSourceDto } from './dto/create-source.dto';
import { UpdateSourceDto } from './dto/update-source.dto';
import { LinkSourceDto, UpdateSourceLinkDto } from './dto/link-source.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('sources')
@Controller('sources')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SourcesController {
  constructor(private readonly sourcesService: SourcesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all sources' })
  @ApiResponse({ status: 200, description: 'List of all sources' })
  @ApiQuery({ name: 'pathId', required: false, description: 'Filter by learning path' })
  async findAll(@Query('pathId') pathId?: string) {
    if (pathId) {
      return await this.sourcesService.findByPath(pathId);
    }
    return await this.sourcesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single source by ID' })
  @ApiResponse({ status: 200, description: 'Source found' })
  @ApiResponse({ status: 404, description: 'Source not found' })
  async findOne(@Param('id') id: string) {
    return await this.sourcesService.findOne(id);
  }

  @Get(':id/paths')
  @ApiOperation({ summary: 'Get all learning paths linked to a source' })
  @ApiResponse({ status: 200, description: 'List of linked paths' })
  async getLinkedPaths(@Param('id') id: string) {
    return await this.sourcesService.getLinkedPaths(id);
  }

  @Get('path/:pathId')
  @ApiOperation({ summary: 'Get sources for a specific learning path' })
  @ApiResponse({ status: 200, description: 'Sources for the learning path' })
  async findByPath(@Param('pathId') pathId: string) {
    return await this.sourcesService.findByPath(pathId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new source (or return existing if URL matches)' })
  @ApiResponse({ status: 201, description: 'Source created or found' })
  async create(@Body() createSourceDto: CreateSourceDto) {
    return await this.sourcesService.createOrFind(createSourceDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a source (name, type)' })
  @ApiResponse({ status: 200, description: 'Source updated' })
  @ApiResponse({ status: 404, description: 'Source not found' })
  async update(@Param('id') id: string, @Body() updateSourceDto: UpdateSourceDto) {
    return await this.sourcesService.update(id, updateSourceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a source (cascades to all path links)' })
  @ApiResponse({ status: 200, description: 'Source deleted' })
  @ApiResponse({ status: 404, description: 'Source not found' })
  async remove(@Param('id') id: string) {
    await this.sourcesService.remove(id);
    return { deleted: true };
  }

  @Post(':id/link/:pathId')
  @ApiOperation({ summary: 'Link a source to a learning path' })
  @ApiResponse({ status: 201, description: 'Source linked to path' })
  @ApiResponse({ status: 400, description: 'Source already linked to path' })
  @ApiResponse({ status: 404, description: 'Source or path not found' })
  async linkToPath(
    @Param('id') sourceId: string,
    @Param('pathId') pathId: string,
    @Body() linkSourceDto: LinkSourceDto,
  ) {
    return await this.sourcesService.linkToPath(
      sourceId,
      pathId,
      linkSourceDto.enabled ?? true,
    );
  }

  @Delete(':id/link/:pathId')
  @ApiOperation({ summary: 'Unlink a source from a learning path' })
  @ApiResponse({ status: 200, description: 'Source unlinked from path' })
  @ApiResponse({ status: 404, description: 'Link not found' })
  async unlinkFromPath(
    @Param('id') sourceId: string,
    @Param('pathId') pathId: string,
  ) {
    await this.sourcesService.unlinkFromPath(sourceId, pathId);
    return { unlinked: true };
  }

  @Patch(':id/link/:pathId')
  @ApiOperation({ summary: 'Update link settings (enabled)' })
  @ApiResponse({ status: 200, description: 'Link updated' })
  @ApiResponse({ status: 404, description: 'Link not found' })
  async updateLink(
    @Param('id') sourceId: string,
    @Param('pathId') pathId: string,
    @Body() updateLinkDto: UpdateSourceLinkDto,
  ) {
    return await this.sourcesService.updateLinkEnabled(
      sourceId,
      pathId,
      updateLinkDto.enabled,
    );
  }
}
