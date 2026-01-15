import { IsArray, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class RequestFeedbackDto {
  @ApiPropertyOptional({
    description: 'Custom rubric criteria (optional, uses defaults if not provided)',
    type: [String],
    example: ['Correctness', 'Code Quality', 'Best Practices'],
  })
  @IsArray()
  @IsOptional()
  rubricCriteria?: string[];
}
