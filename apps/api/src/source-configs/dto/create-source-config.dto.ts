import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSourceConfigDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  pathId: string;

  @ApiProperty({ example: 'https://javascriptweekly.com/rss' })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiProperty({ enum: ['rss', 'article', 'pdf'] })
  @IsEnum(['rss', 'article', 'pdf'])
  type: string;

  @ApiProperty({ example: 'JavaScript Weekly' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false, default: true })
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;
}
