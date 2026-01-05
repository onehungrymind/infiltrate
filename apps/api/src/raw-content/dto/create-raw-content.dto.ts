import { IsString, IsNotEmpty, IsOptional, IsDateString, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRawContentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  pathId: string;

  @ApiProperty({ example: 'rss' })
  @IsString()
  @IsNotEmpty()
  sourceType: string;

  @ApiProperty({ example: 'https://javascriptweekly.com/issues/766' })
  @IsString()
  @IsNotEmpty()
  sourceUrl: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  author?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  publishedDate?: string;

  @ApiProperty({ required: false, type: Object })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}
