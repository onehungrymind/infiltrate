import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum,IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateConceptDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  pathId: string;

  @ApiProperty({ example: 'Server Components' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Components that render on the server and stream to the client' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ required: false, default: 1 })
  @IsNumber()
  @IsOptional()
  estimatedHours?: number;

  @ApiProperty({ enum: ['foundational', 'intermediate', 'advanced'], required: false, default: 'foundational' })
  @IsEnum(['foundational', 'intermediate', 'advanced'])
  @IsOptional()
  difficulty?: string;

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsOptional()
  prerequisites?: string[];

  @ApiProperty({ required: false, default: 0 })
  @IsNumber()
  @IsOptional()
  order?: number;
}
