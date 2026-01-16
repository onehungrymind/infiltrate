import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, Max,Min } from 'class-validator';

import { CreateSubmissionDto } from './create-submission.dto';

export class UpdateSubmissionDto extends PartialType(CreateSubmissionDto) {
  @ApiPropertyOptional({
    description: 'Submission status',
    enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected'],
  })
  @IsEnum(['draft', 'submitted', 'under_review', 'approved', 'rejected'])
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: 'Score (0-100)', minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  score?: number;
}
