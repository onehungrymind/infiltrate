import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import {
  SessionContent,
  SessionDifficulty,
  SessionVisibility,
} from '@kasita/common-models';

export class CreateSessionDto {
  @ApiProperty({ example: 'Kubernetes Fundamentals' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'kubernetes-fundamentals' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ example: "A Practitioner's Guide" })
  @IsOptional()
  @IsString()
  subtitle?: string;

  @ApiProperty({ example: 'Learn the core concepts of Kubernetes' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'DevOps' })
  @IsString()
  @IsNotEmpty()
  domain: string;

  @ApiPropertyOptional({ example: ['kubernetes', 'docker', 'devops'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    example: 'beginner',
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
  })
  @IsOptional()
  @IsIn(['beginner', 'intermediate', 'advanced', 'expert'])
  difficulty?: SessionDifficulty;

  @ApiPropertyOptional({ example: 60 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  estimatedMinutes?: number;

  @ApiPropertyOptional({ example: "Practitioner's Guide" })
  @IsOptional()
  @IsString()
  badgeText?: string;

  @ApiPropertyOptional({ example: ['24 Exercises', '3 Methods'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  coverMeta?: string[];

  @ApiPropertyOptional({
    example: 'private',
    enum: ['private', 'unlisted', 'public'],
  })
  @IsOptional()
  @IsIn(['private', 'unlisted', 'public'])
  visibility?: SessionVisibility;

  @ApiProperty({
    description: 'Session content with parts and sections',
    example: {
      parts: [
        {
          id: 'part-1',
          number: 'I',
          title: 'Getting Started',
          sections: [
            {
              id: 'section-1',
              title: 'Introduction',
              anchor: 'introduction',
              blocks: [{ type: 'prose', content: 'Welcome to the session.' }],
            },
          ],
        },
      ],
    },
  })
  @IsObject()
  @IsNotEmpty()
  content: SessionContent;
}
