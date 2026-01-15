import { IsString, IsNotEmpty, IsOptional, IsEnum, MaxLength, IsObject, ValidateNested, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UrlMetadataDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  platform?: string;

  @IsOptional()
  @IsObject()
  repoStats?: {
    stars?: number;
    language?: string;
    lastCommit?: Date;
  };
}

export class FileMetadataDto {
  @IsString()
  originalName: string;

  @IsString()
  mimeType: string;

  @IsNumber()
  @Min(0)
  size: number;

  @IsString()
  storagePath: string;
}

export class CreateSubmissionDto {
  @ApiProperty({ description: 'User ID of the submitter' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiPropertyOptional({ description: 'Knowledge Unit ID (deprecated - use challengeId)' })
  @IsString()
  @IsOptional()
  unitId?: string;

  @ApiPropertyOptional({ description: 'Challenge ID this submission is for' })
  @IsString()
  @IsOptional()
  challengeId?: string;

  @ApiPropertyOptional({ description: 'Project ID this submission is for' })
  @IsString()
  @IsOptional()
  projectId?: string;

  @ApiPropertyOptional({ description: 'Learning Path ID (optional)' })
  @IsString()
  @IsOptional()
  pathId?: string;

  @ApiProperty({ description: 'Title of the submission', maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({
    description: 'Type of content',
    enum: ['text', 'url', 'file'],
    default: 'text',
  })
  @IsEnum(['text', 'url', 'file'])
  @IsOptional()
  contentType?: string;

  @ApiProperty({ description: 'The submission content (text, URL, or file path)' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ description: 'URL metadata when contentType is url' })
  @IsOptional()
  @ValidateNested()
  @Type(() => UrlMetadataDto)
  urlMetadata?: UrlMetadataDto;

  @ApiPropertyOptional({ description: 'File metadata when contentType is file' })
  @IsOptional()
  @ValidateNested()
  @Type(() => FileMetadataDto)
  fileMetadata?: FileMetadataDto;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
