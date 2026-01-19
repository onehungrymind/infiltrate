import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

import { SessionDifficulty, SessionVisibility } from '@kasita/common-models';

export class GenerateSessionDto {
  @ApiProperty({
    example: 'Kubernetes Fundamentals',
    description: 'The main topic for the session',
  })
  @IsString()
  @IsNotEmpty()
  topic: string;

  @ApiPropertyOptional({
    example: 'DevOps engineers new to container orchestration',
    description: 'Who is this session for?',
  })
  @IsOptional()
  @IsString()
  targetAudience?: string;

  @ApiPropertyOptional({
    example: 'beginner',
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    description: 'Difficulty level',
  })
  @IsOptional()
  @IsIn(['beginner', 'intermediate', 'advanced', 'expert'])
  difficulty?: SessionDifficulty;

  @ApiPropertyOptional({
    example: '60 minutes',
    description: 'Target length for the session',
  })
  @IsOptional()
  @IsString()
  estimatedLength?: string;

  @ApiPropertyOptional({
    example: ['kubectl', 'pods', 'services', 'deployments'],
    description: 'Specific areas to focus on',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  focusAreas?: string[];

  @ApiPropertyOptional({
    example: 'bash',
    description: 'Primary programming/scripting language for examples',
  })
  @IsOptional()
  @IsString()
  codeLanguage?: string;

  @ApiPropertyOptional({
    example: 'professional',
    enum: ['professional', 'casual', 'academic'],
    description: 'Writing tone',
  })
  @IsOptional()
  @IsIn(['professional', 'casual', 'academic'])
  tone?: 'professional' | 'casual' | 'academic';

  @ApiPropertyOptional({
    example: 'private',
    enum: ['private', 'unlisted', 'public'],
    description: 'Session visibility',
  })
  @IsOptional()
  @IsIn(['private', 'unlisted', 'public'])
  visibility?: SessionVisibility;
}
