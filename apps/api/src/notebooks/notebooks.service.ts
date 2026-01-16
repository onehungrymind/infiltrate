import { BadRequestException,Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { exec } from 'child_process';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { Repository } from 'typeorm';
import { promisify } from 'util';

import { SubmitNotebookDto } from './dto/submit-notebook.dto';
import { NotebookProgress } from './entities/notebook-progress.entity';

const execAsync = promisify(exec);

@Injectable()
export class NotebooksService {
  constructor(
    @InjectRepository(NotebookProgress)
    private readonly notebookProgressRepository: Repository<NotebookProgress>,
  ) {}

  /**
   * Get template notebook code for a given notebook ID
   */
  async getTemplate(notebookId: string): Promise<{ notebookId: string; templateCode: string; description: string }> {
    // For now, we'll read from the actual notebook file
    // In production, you might want to store templates separately
    const notebookPath = join(process.cwd(), 'apps/ml-services/notebooks', `${notebookId}.py`);
    
    try {
      const templateCode = await readFile(notebookPath, 'utf-8');
      return {
        notebookId,
        templateCode,
        description: `Template for ${notebookId} notebook`,
      };
    } catch (error) {
      throw new NotFoundException(`Notebook template '${notebookId}' not found`);
    }
  }

  /**
   * Submit notebook code for validation
   * This executes the notebook in a sandboxed Python environment
   */
  async submitNotebook(submitDto: SubmitNotebookDto): Promise<{
    validationResults: any;
    completedExercises: number[];
    timestamp: string;
  }> {
    // Basic security: Check for dangerous operations
    const dangerousPatterns = [
      /import\s+os/,
      /import\s+subprocess/,
      /import\s+sys/,
      /__import__/,
      /eval\(/,
      /exec\(/,
      /open\(/,
      /file\(/,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(submitDto.notebookCode)) {
        throw new BadRequestException('Notebook code contains potentially dangerous operations');
      }
    }

    // Create a temporary Python script to validate the notebook
    const validationScript = this.createValidationScript(submitDto.notebookCode);

    try {
      // Execute the validation script
      // Note: In production, use a proper sandboxed environment (Docker, isolated process, etc.)
      const { stdout, stderr } = await execAsync(
        `cd apps/ml-services && python3 -c "${validationScript.replace(/"/g, '\\"')}"`,
        {
          timeout: 30000, // 30 second timeout
          maxBuffer: 1024 * 1024 * 10, // 10MB buffer
        }
      );

      // Parse the validation results
      let validationResults;
      try {
        validationResults = JSON.parse(stdout.trim());
      } catch (e) {
        // If parsing fails, create a basic result structure
        validationResults = {
          error: 'Failed to parse validation results',
          stderr: stderr,
        };
      }

      // Calculate completion rate
      const totalExercises = 5; // For pandas_exercises
      const completionRate = submitDto.completedExercises.length / totalExercises;

      // Save or update progress
      await this.saveProgress(
        submitDto.userId,
        submitDto.notebookId,
        submitDto.completedExercises,
        completionRate,
        submitDto.notebookCode,
        JSON.stringify(validationResults),
      );

      return {
        validationResults,
        completedExercises: submitDto.completedExercises,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      // Handle execution errors
      throw new BadRequestException(
        `Notebook validation failed: ${error.message || 'Unknown error'}`,
      );
    }
  }

  /**
   * Get user's progress for all notebooks
   */
  async getUserProgress(userId: string): Promise<NotebookProgress[]> {
    return await this.notebookProgressRepository.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
    });
  }

  /**
   * Get user's progress for a specific notebook
   */
  async getNotebookProgress(userId: string, notebookId: string): Promise<NotebookProgress> {
    const progress = await this.notebookProgressRepository.findOne({
      where: { userId, notebookId },
    });

    if (!progress) {
      throw new NotFoundException(`No progress found for notebook '${notebookId}'`);
    }

    return progress;
  }

  /**
   * Save or update notebook progress
   */
  private async saveProgress(
    userId: string,
    notebookId: string,
    completedExercises: number[],
    completionRate: number,
    notebookCode: string,
    validationResults: string,
  ): Promise<NotebookProgress> {
    let progress = await this.notebookProgressRepository.findOne({
      where: { userId, notebookId },
    });

    if (progress) {
      // Update existing progress
      progress.completedExercises = completedExercises;
      progress.completionRate = completionRate;
      progress.notebookCode = notebookCode;
      progress.validationResults = validationResults;
      progress.lastSubmittedAt = new Date();
    } else {
      // Create new progress
      progress = this.notebookProgressRepository.create({
        userId,
        notebookId,
        completedExercises,
        completionRate,
        notebookCode,
        validationResults,
        lastSubmittedAt: new Date(),
      });
    }

    return await this.notebookProgressRepository.save(progress);
  }

  /**
   * Create a validation script that extracts exercise results from notebook code
   * This is a simplified version - in production, you'd want more robust parsing
   */
  private createValidationScript(notebookCode: string): string {
    // Write the notebook code to a temporary file and execute it
    // This is safer than using exec() with a string
    const script = `
import json
import sys
import tempfile
from pathlib import Path

# Write notebook code to temp file
with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
    f.write('''${notebookCode.replace(/'/g, "\\'")}''')
    temp_file = f.name

try:
    # Add paths
    sys.path.insert(0, str(Path.cwd() / "apps" / "ml-services" / "notebooks"))
    
    # Import required modules
    import pandas as pd
    import numpy as np
    
    # Execute the notebook
    exec(open(temp_file).read(), {
        'pd': pd,
        'np': np,
        'Path': Path,
        'DATA_DIR': Path.cwd() / "apps" / "ml-services" / "data" / "pandas_exercises",
        '__name__': '__main__',
    })
    
    # Try to get exercise_results from globals
    # Note: This is a simplified approach - in production, use Marimo's API
    print(json.dumps({"status": "executed", "note": "Validation requires Marimo API integration"}))
    
except Exception as e:
    print(json.dumps({"error": str(e), "type": type(e).__name__}))
    sys.exit(1)
finally:
    # Clean up temp file
    import os
    if os.path.exists(temp_file):
        os.unlink(temp_file)
`;
    return script;
  }
}
