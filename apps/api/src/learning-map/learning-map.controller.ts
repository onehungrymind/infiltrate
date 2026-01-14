import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LearningMapService } from './learning-map.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('learning-map')
@Controller('learning-map')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LearningMapController {
  constructor(private readonly learningMapService: LearningMapService) {}

  @Get('path/:outcomeId')
  @ApiOperation({ summary: 'Get learning path map structure' })
  @ApiResponse({ status: 200, description: 'Learning path map retrieved successfully' })
  async getLearningPath(
    @Param('outcomeId') outcomeId: string,
    @Query('userId') userId: string,
    @Request() req: any,
  ) {
    // Override userId from JWT for security
    const actualUserId = req.user.userId || userId;
    return await this.learningMapService.getLearningPath(actualUserId, outcomeId);
  }

  @Get('progress/:pathId')
  @ApiOperation({ summary: 'Get user progress for a learning path' })
  @ApiResponse({ status: 200, description: 'Progress retrieved successfully' })
  async getUserProgress(
    @Param('pathId') pathId: string,
    @Query('userId') userId: string,
    @Request() req: any,
  ) {
    const actualUserId = req.user.userId || userId;
    return await this.learningMapService.getUserProgress(actualUserId, pathId);
  }

  @Get('nodes/:nodeId')
  @ApiOperation({ summary: 'Get node details' })
  @ApiResponse({ status: 200, description: 'Node details retrieved successfully' })
  async getNodeDetails(@Param('nodeId') nodeId: string) {
    return await this.learningMapService.getNodeDetails(nodeId);
  }

  @Patch('nodes/:nodeId/status')
  @ApiOperation({ summary: 'Update node status' })
  @ApiResponse({ status: 200, description: 'Node status updated successfully' })
  async updateNodeStatus(
    @Param('nodeId') nodeId: string,
    @Body() body: { status: string; metrics?: Record<string, any> },
  ) {
    return await this.learningMapService.updateNodeStatus(nodeId, body.status, body.metrics);
  }

  @Post('nodes/:nodeId/unlock')
  @ApiOperation({ summary: 'Unlock a node' })
  @ApiResponse({ status: 200, description: 'Node unlocked successfully' })
  async unlockNode(@Param('nodeId') nodeId: string) {
    return await this.learningMapService.unlockNode(nodeId);
  }

  @Post('nodes/:nodeId/complete')
  @ApiOperation({ summary: 'Record node completion' })
  @ApiResponse({ status: 200, description: 'Node completion recorded successfully' })
  async recordNodeCompletion(
    @Param('nodeId') nodeId: string,
    @Body() body: { metrics: Record<string, any> },
  ) {
    return await this.learningMapService.recordNodeCompletion(nodeId, body.metrics);
  }

  @Get('outcomes/:outcomeId/time-estimate')
  @ApiOperation({ summary: 'Get estimated time to completion' })
  @ApiResponse({ status: 200, description: 'Time estimate retrieved successfully' })
  async getEstimatedTimeToCompletion(@Param('outcomeId') outcomeId: string) {
    return await this.learningMapService.getEstimatedTimeToCompletion(outcomeId);
  }

  @Get('principles/:pathId')
  @ApiOperation({ summary: 'Get principle-based learning map for a learning path' })
  @ApiResponse({ status: 200, description: 'Principle map retrieved successfully' })
  async getPrincipleMap(@Param('pathId') pathId: string) {
    return await this.learningMapService.getPrincipleMap(pathId);
  }

  @Get('learning-paths')
  @ApiOperation({ summary: 'Get all learning paths with principle counts' })
  @ApiResponse({ status: 200, description: 'Learning paths retrieved successfully' })
  async getLearningPathsForMap() {
    return await this.learningMapService.getLearningPathsForMap();
  }

  @Post('generate/:pathId')
  @ApiOperation({ summary: 'Generate principles for a learning path using AI' })
  @ApiResponse({ status: 201, description: 'Principles generated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - path already has principles or AI not configured' })
  @ApiResponse({ status: 404, description: 'Learning path not found' })
  async generatePrinciples(
    @Param('pathId') pathId: string,
    @Body() body: { force?: boolean } = {},
  ) {
    return await this.learningMapService.generatePrinciplesWithAI(pathId, body.force);
  }
}
