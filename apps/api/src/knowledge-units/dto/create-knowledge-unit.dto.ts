import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsNumber,IsOptional, IsString } from 'class-validator';

export class CreateKnowledgeUnitDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  pathId: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  principleId?: string;

  @ApiProperty({ enum: ['structured', 'discovered'], default: 'discovered' })
  @IsEnum(['structured', 'discovered'])
  @IsOptional()
  type?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  subConceptId?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  concept: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  answer: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  elaboration?: string;

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsOptional()
  examples?: string[];

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsOptional()
  analogies?: string[];

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsOptional()
  commonMistakes?: string[];

  @ApiProperty({ enum: ['beginner', 'intermediate', 'advanced', 'expert'] })
  @IsEnum(['beginner', 'intermediate', 'advanced', 'expert'])
  difficulty: string;

  @ApiProperty({ enum: ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'] })
  @IsEnum(['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'])
  cognitiveLevel: string;

  @ApiProperty({ required: false, default: 120 })
  @IsNumber()
  @IsOptional()
  estimatedTimeSeconds?: number;

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsOptional()
  sourceIds?: string[];
}
