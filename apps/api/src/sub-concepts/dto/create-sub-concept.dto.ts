import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateSubConceptDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  conceptId: string;

  @ApiProperty({ example: 'Component Composition' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Understanding how to compose components together for reusable UI patterns' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ required: false, default: 0 })
  @IsNumber()
  @IsOptional()
  order?: number;
}
