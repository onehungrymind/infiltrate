import { IsString, IsOptional, IsNumber, IsArray } from 'class-validator';
import { ClassroomSection, ClassroomContentStatus } from '../entities/classroom-content.entity';

export class CreateClassroomContentDto {
  @IsString()
  subConceptId: string;

  @IsString()
  conceptId: string;

  @IsString()
  learningPathId: string;

  @IsString()
  title: string;

  @IsString()
  summary: string;

  @IsArray()
  sections: ClassroomSection[];

  @IsNumber()
  @IsOptional()
  estimatedReadTime?: number;

  @IsNumber()
  @IsOptional()
  wordCount?: number;

  @IsArray()
  @IsOptional()
  sourceKuIds?: string[];
}

export class UpdateClassroomContentDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  summary?: string;

  @IsArray()
  @IsOptional()
  sections?: ClassroomSection[];

  @IsNumber()
  @IsOptional()
  estimatedReadTime?: number;

  @IsNumber()
  @IsOptional()
  wordCount?: number;

  @IsString()
  @IsOptional()
  status?: ClassroomContentStatus;

  @IsArray()
  @IsOptional()
  sourceKuIds?: string[];

  @IsString()
  @IsOptional()
  errorMessage?: string;
}

export class RegenerateClassroomContentDto {
  @IsString()
  type: 'sub-concept' | 'concept' | 'learning-path';

  @IsString()
  id: string;

  @IsString()
  @IsOptional()
  name?: string;

  // For sub-concept regeneration, provide parent context
  @IsString()
  @IsOptional()
  learningPathId?: string;

  @IsString()
  @IsOptional()
  conceptId?: string;

  @IsString()
  @IsOptional()
  conceptName?: string;
}

export class ClassroomStatusResponseDto {
  status: 'pending' | 'generating' | 'ready' | 'partial';
  progress: { completed: number; total: number };
  concepts: Array<{
    conceptId: string;
    status: string;
    subConcepts: Array<{ subConceptId: string; status: string }>;
  }>;
}
