import { IsString, IsOptional, IsNumber, IsArray, IsBoolean, Min } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  pathId: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  objectives?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requirements?: string[];

  @IsOptional()
  @IsNumber()
  @Min(1)
  estimatedHours?: number;

  @IsOptional()
  @IsString()
  difficulty?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
