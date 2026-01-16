import { ApiProperty } from '@nestjs/swagger';
import { IsEnum,IsNotEmpty, IsString } from 'class-validator';

export class CreateSourceDto {
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
}
