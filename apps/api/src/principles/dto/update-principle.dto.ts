import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

import { CreatePrincipleDto } from './create-principle.dto';

export class UpdatePrincipleDto extends PartialType(CreatePrincipleDto) {
  @ApiProperty({ enum: ['pending', 'in_progress', 'mastered'], required: false })
  @IsEnum(['pending', 'in_progress', 'mastered'])
  @IsOptional()
  status?: string;
}
