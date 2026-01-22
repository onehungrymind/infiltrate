import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { ReadingStatus } from '../entities/reading-progress.entity';

export class UpdateReadingProgressDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  scrollPosition?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  readTime?: number; // Seconds spent in this session
}

export class ReadingProgressResponseDto {
  id: string;
  classroomContentId: string;
  subConceptId: string;
  conceptId: string;
  learningPathId: string;
  status: ReadingStatus;
  scrollPosition: number;
  lastReadAt: Date | null;
  completedAt: Date | null;
  totalReadTime: number;
  sessionCount: number;
}

export class ConceptProgressResponseDto {
  conceptId: string;
  overallProgress: number;
  subConcepts: Array<{
    subConceptId: string;
    progress: ReadingProgressResponseDto;
  }>;
}
