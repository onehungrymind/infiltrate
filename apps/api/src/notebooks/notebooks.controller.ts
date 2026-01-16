import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth,ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubmitNotebookDto } from './dto/submit-notebook.dto';
import { NotebooksService } from './notebooks.service';

@ApiTags('notebooks')
@Controller('notebooks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotebooksController {
  constructor(private readonly notebooksService: NotebooksService) {}

  @Get('template/:notebookId')
  @ApiOperation({ summary: 'Get notebook template' })
  @ApiResponse({ status: 200, description: 'Notebook template retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Notebook template not found' })
  async getTemplate(@Param('notebookId') notebookId: string) {
    return await this.notebooksService.getTemplate(notebookId);
  }

  @Post('submit')
  @ApiOperation({ summary: 'Submit notebook for validation' })
  @ApiResponse({ status: 200, description: 'Notebook submitted and validated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid notebook code' })
  async submitNotebook(@Body() submitDto: SubmitNotebookDto, @Request() req: any) {
    // Override userId from JWT token for security
    submitDto.userId = req.user.userId;
    return await this.notebooksService.submitNotebook(submitDto);
  }

  @Get('user/:userId/progress')
  @ApiOperation({ summary: 'Get user progress for all notebooks' })
  @ApiResponse({ status: 200, description: 'User progress retrieved successfully' })
  async getUserProgress(@Param('userId') userId: string, @Request() req: any) {
    // Ensure user can only access their own progress
    if (req.user.userId !== userId) {
      throw new Error('Unauthorized: Cannot access other users\' progress');
    }
    return await this.notebooksService.getUserProgress(userId);
  }

  @Get('user/:userId/progress/:notebookId')
  @ApiOperation({ summary: 'Get user progress for a specific notebook' })
  @ApiResponse({ status: 200, description: 'Notebook progress retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Progress not found' })
  async getNotebookProgress(
    @Param('userId') userId: string,
    @Param('notebookId') notebookId: string,
    @Request() req: any,
  ) {
    // Ensure user can only access their own progress
    if (req.user.userId !== userId) {
      throw new Error('Unauthorized: Cannot access other users\' progress');
    }
    return await this.notebooksService.getNotebookProgress(userId, notebookId);
  }
}
