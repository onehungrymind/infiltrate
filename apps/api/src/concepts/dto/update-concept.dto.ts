import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

import { CreateConceptDto } from './create-concept.dto';

export class UpdateConceptDto extends PartialType(CreateConceptDto) {
  @ApiProperty({ enum: ['pending', 'in_progress', 'mastered'], required: false })
  @IsEnum(['pending', 'in_progress', 'mastered'])
  @IsOptional()
  status?: string;
}
