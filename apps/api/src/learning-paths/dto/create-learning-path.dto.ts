import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLearningPathDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userId: string;

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
}
