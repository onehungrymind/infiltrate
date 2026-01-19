import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Query,
  Headers,
  Res,
} from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiQuery,
  ApiProduces,
} from '@nestjs/swagger';
import { Response } from 'express';

import { GymnasiumService, PaginatedSessions } from './gymnasium.service';
import { SessionRendererService } from './rendering/session-renderer.service';
import { SessionGeneratorService } from './generation/session-generator.service';
import { CreateSessionDto, UpdateSessionDto, SessionQueryDto, GenerateSessionDto } from './dto';
import { Session } from './entities/session.entity';
import { SessionTemplate } from './entities/session-template.entity';
import { SAMPLE_SESSION } from './sample-session';

@ApiTags('gymnasium')
@Controller('gymnasium')
export class GymnasiumController {
  constructor(
    private readonly gymnasiumService: GymnasiumService,
    private readonly rendererService: SessionRendererService,
    private readonly generatorService: SessionGeneratorService,
  ) {}

  // ===========================
  // Session Endpoints
  // ===========================

  @Post('sessions')
  @ApiOperation({ summary: 'Create a new session' })
  @ApiResponse({ status: 201, description: 'Session created successfully' })
  async createSession(
    @Body() createSessionDto: CreateSessionDto,
    @Headers('x-user-id') userId: string,
  ): Promise<Session> {
    // In production, get userId from JWT token
    const creatorId = userId || 'anonymous';
    return this.gymnasiumService.createSession(createSessionDto, creatorId);
  }

  @Public()
  @Get('sessions')
  @ApiOperation({ summary: 'List all sessions with optional filters' })
  @ApiResponse({ status: 200, description: 'List of sessions' })
  async findAllSessions(
    @Query() query: SessionQueryDto,
  ): Promise<PaginatedSessions> {
    return this.gymnasiumService.findAllSessions(query);
  }

  @Public()
  @Get('sessions/public')
  @ApiOperation({ summary: 'Get public sessions' })
  @ApiResponse({ status: 200, description: 'List of public sessions' })
  async getPublicSessions(
    @Query('limit') limit?: number,
  ): Promise<Session[]> {
    return this.gymnasiumService.getPublicSessions(limit || 10);
  }

  @Public()
  @Get('sessions/by-slug/:slug')
  @ApiOperation({ summary: 'Get a session by slug' })
  @ApiParam({ name: 'slug', description: 'Session slug' })
  @ApiResponse({ status: 200, description: 'Session found' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async findSessionBySlug(@Param('slug') slug: string): Promise<Session> {
    return this.gymnasiumService.findSessionBySlug(slug);
  }

  @Public()
  @Get('sessions/by-slug/:slug/render')
  @ApiOperation({ summary: 'Render session by slug as HTML' })
  @ApiParam({ name: 'slug', description: 'Session slug' })
  @ApiQuery({ name: 'template', required: false, description: 'Template ID to use' })
  @ApiProduces('text/html')
  @ApiResponse({ status: 200, description: 'Rendered HTML' })
  @Header('Content-Type', 'text/html')
  async renderSessionBySlug(
    @Param('slug') slug: string,
    @Query('template') templateId?: string,
  ): Promise<string> {
    const session = await this.gymnasiumService.findSessionBySlug(slug);
    return this.rendererService.renderSession(session.id, templateId);
  }

  @Public()
  @Get('sessions/:id')
  @ApiOperation({ summary: 'Get a session by ID' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: 200, description: 'Session found' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async findSessionById(@Param('id') id: string): Promise<Session> {
    return this.gymnasiumService.findSessionById(id);
  }

  @Public()
  @Get('sessions/:id/raw')
  @ApiOperation({ summary: 'Get raw session content for export' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: 200, description: 'Raw session data' })
  async getSessionRaw(@Param('id') id: string): Promise<Session> {
    return this.gymnasiumService.getSessionRaw(id);
  }

  @Public()
  @Get('sessions/:id/render')
  @ApiOperation({ summary: 'Render session as HTML' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiQuery({ name: 'template', required: false, description: 'Template ID to use' })
  @ApiProduces('text/html')
  @ApiResponse({ status: 200, description: 'Rendered HTML' })
  @Header('Content-Type', 'text/html')
  async renderSession(
    @Param('id') id: string,
    @Query('template') templateId?: string,
  ): Promise<string> {
    return this.rendererService.renderSession(id, templateId);
  }

  @Public()
  @Get('sessions/:id/export')
  @ApiOperation({ summary: 'Export session as HTML file download' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiQuery({ name: 'template', required: false, description: 'Template ID to use' })
  @ApiQuery({ name: 'filename', required: false, description: 'Custom filename' })
  @ApiResponse({ status: 200, description: 'HTML file download' })
  async exportSession(
    @Param('id') id: string,
    @Query('template') templateId: string,
    @Query('filename') filename: string,
    @Res() res: Response,
  ): Promise<void> {
    const session = await this.gymnasiumService.findSessionById(id);
    const html = await this.rendererService.renderSession(id, templateId);

    // Generate filename from session title if not provided
    const exportFilename = filename ||
      `${session.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.html`;

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="${exportFilename}"`);
    res.send(html);
  }

  @Patch('sessions/:id')
  @ApiOperation({ summary: 'Update a session' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: 200, description: 'Session updated successfully' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async updateSession(
    @Param('id') id: string,
    @Body() updateSessionDto: UpdateSessionDto,
  ): Promise<Session> {
    return this.gymnasiumService.updateSession(id, updateSessionDto);
  }

  @Delete('sessions/:id')
  @ApiOperation({ summary: 'Delete a session' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: 200, description: 'Session deleted successfully' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async deleteSession(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.gymnasiumService.deleteSession(id);
    return { success: true };
  }

  @Post('sessions/:id/publish')
  @ApiOperation({ summary: 'Publish a session (make it public)' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: 200, description: 'Session published' })
  async publishSession(@Param('id') id: string): Promise<Session> {
    return this.gymnasiumService.publishSession(id);
  }

  @Post('sessions/:id/unpublish')
  @ApiOperation({ summary: 'Unpublish a session (make it private)' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: 200, description: 'Session unpublished' })
  async unpublishSession(@Param('id') id: string): Promise<Session> {
    return this.gymnasiumService.unpublishSession(id);
  }

  // ===========================
  // Template Endpoints
  // ===========================

  @Public()
  @Get('templates')
  @ApiOperation({ summary: 'List all available templates' })
  @ApiResponse({ status: 200, description: 'List of templates' })
  async findAllTemplates(): Promise<SessionTemplate[]> {
    return this.gymnasiumService.findAllTemplates();
  }

  @Public()
  @Get('templates/default')
  @ApiOperation({ summary: 'Get the default template' })
  @ApiResponse({ status: 200, description: 'Default template' })
  async getDefaultTemplate(): Promise<SessionTemplate> {
    return this.gymnasiumService.getDefaultTemplate();
  }

  @Public()
  @Get('templates/:id')
  @ApiOperation({ summary: 'Get a template by ID' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiResponse({ status: 200, description: 'Template found' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async findTemplateById(@Param('id') id: string): Promise<SessionTemplate> {
    return this.gymnasiumService.findTemplateById(id);
  }

  // ===========================
  // AI Generation Endpoint
  // ===========================

  @Post('sessions/generate')
  @ApiOperation({ summary: 'Generate a new session using AI' })
  @ApiResponse({ status: 201, description: 'Session generated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request or AI unavailable' })
  async generateSession(
    @Body() generateDto: GenerateSessionDto,
    @Headers('x-user-id') userId: string,
  ): Promise<Session> {
    const creatorId = userId || 'ai-generator';

    // Generate the session content using AI
    const generated = await this.generatorService.generateSession(generateDto);

    // Save to database with visibility from DTO (defaults to private)
    return this.gymnasiumService.createSession(
      {
        ...generated,
        visibility: generateDto.visibility || 'private',
      },
      creatorId,
    );
  }

  @Post('sessions/generate/preview')
  @ApiOperation({ summary: 'Generate a session preview without saving' })
  @ApiResponse({ status: 200, description: 'Generated session preview' })
  @ApiResponse({ status: 400, description: 'Invalid request or AI unavailable' })
  async generateSessionPreview(
    @Body() generateDto: GenerateSessionDto,
  ): Promise<any> {
    // Generate without saving - returns the raw generated content
    return this.generatorService.generateSession(generateDto);
  }

  // ===========================
  // Seed Endpoint (Dev)
  // ===========================

  @Public()
  @Post('seed')
  @ApiOperation({ summary: 'Seed a sample session for testing' })
  @ApiResponse({ status: 201, description: 'Sample session created' })
  async seedSampleSession(): Promise<Session> {
    return this.gymnasiumService.createSession(SAMPLE_SESSION, 'seed-user');
  }
}
