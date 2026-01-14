import { PartialType } from '@nestjs/swagger';
import { CreatePrincipleDto } from './create-principle.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePrincipleDto extends PartialType(CreatePrincipleDto) {
  @ApiProperty({ enum: ['pending', 'in_progress', 'mastered'], required: false })
  @IsEnum(['pending', 'in_progress', 'mastered'])
  @IsOptional()
  status?: string;
}
