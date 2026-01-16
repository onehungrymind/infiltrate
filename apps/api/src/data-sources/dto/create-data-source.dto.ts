import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsObject,IsOptional, IsString } from 'class-validator';

export class CreateDataSourceDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  archiveUrl?: string;

  @ApiProperty({ enum: ['rss', 'article', 'pdf'] })
  @IsEnum(['rss', 'article', 'pdf'])
  type: string;

  @ApiProperty({ type: [String], required: false, default: [] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiProperty({ required: false, default: true })
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @ApiProperty({ enum: ['current', 'archive', 'both'], default: 'current' })
  @IsEnum(['current', 'archive', 'both'])
  parsingMode: string;

  @ApiProperty({ enum: ['daily', 'weekly', 'monthly', 'manual'], required: false })
  @IsEnum(['daily', 'weekly', 'monthly', 'manual'])
  @IsOptional()
  scheduleFrequency?: string;

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  parsingInstructions?: Record<string, any>;
}

