import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsArray,
  IsOptional,
  IsEnum,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class RubricScoreDto {
  @ApiProperty({ description: 'Criterion name', example: 'Correctness' })
  @IsString()
  @IsNotEmpty()
  criterion: string;

  @ApiProperty({ description: 'Points achieved', example: 25 })
  @IsNumber()
  @Min(0)
  achieved: number;

  @ApiProperty({ description: 'Maximum points', example: 30 })
  @IsNumber()
  @Min(0)
  maximum: number;

  @ApiPropertyOptional({ description: 'Criterion-specific feedback' })
  @IsString()
  @IsOptional()
  feedback?: string;
}

export class CreateMentorFeedbackDto {
  @ApiProperty({ description: 'Overall score 0-100', example: 85 })
  @IsNumber()
  @Min(0)
  @Max(100)
  overallScore: number;

  @ApiProperty({
    description: 'Rubric breakdown',
    type: [RubricScoreDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RubricScoreDto)
  rubricBreakdown: RubricScoreDto[];

  @ApiProperty({
    description: 'Improvement suggestions',
    type: [String],
    example: ['Consider adding error handling', 'Add more test cases'],
  })
  @IsArray()
  @IsString({ each: true })
  suggestions: string[];

  @ApiProperty({
    description: 'Detailed feedback content',
    example: 'Great work on the implementation. The code is well-structured...',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    description: 'Grade for project submissions (required for projects)',
    enum: ['accepted', 'accepted_with_comments', 'needs_work'],
  })
  @IsEnum(['accepted', 'accepted_with_comments', 'needs_work'])
  @IsOptional()
  grade?: string;
}
