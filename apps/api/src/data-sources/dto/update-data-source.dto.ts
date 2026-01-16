import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsObject,IsOptional, IsString } from 'class-validator';

export class UpdateDataSourceDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  url?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  archiveUrl?: string;

  @ApiProperty({ enum: ['rss', 'article', 'pdf'], required: false })
  @IsEnum(['rss', 'article', 'pdf'])
  @IsOptional()
  type?: string;

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @ApiProperty({ enum: ['current', 'archive', 'both'], required: false })
  @IsEnum(['current', 'archive', 'both'])
  @IsOptional()
  parsingMode?: string;

  @ApiProperty({ enum: ['daily', 'weekly', 'monthly', 'manual'], required: false })
  @IsEnum(['daily', 'weekly', 'monthly', 'manual'])
  @IsOptional()
  scheduleFrequency?: string;

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  parsingInstructions?: Record<string, any>;
}

