import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSourceDto {
  @ApiProperty({ enum: ['rss', 'article', 'pdf'], required: false })
  @IsEnum(['rss', 'article', 'pdf'])
  @IsOptional()
  type?: string;

  @ApiProperty({ example: 'JavaScript Weekly', required: false })
  @IsString()
  @IsOptional()
  name?: string;
}
