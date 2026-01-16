import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLearningPathDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiPropertyOptional({ description: 'Mentor user ID' })
  @IsOptional()
  @IsString()
  mentorId?: string;

  @ApiProperty({ example: 'React Server Components' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Web Development' })
  @IsString()
  @IsNotEmpty()
  domain: string;

  @ApiProperty({ example: 'Build production RSC app' })
  @IsString()
  @IsNotEmpty()
  targetSkill: string;

  @ApiPropertyOptional({ example: 'not-started', enum: ['not-started', 'in-progress', 'completed'] })
  @IsOptional()
  @IsString()
  @IsIn(['not-started', 'in-progress', 'completed'])
  status?: string;
}
