import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, Max,Min, ValidateNested } from 'class-validator';

export class RubricCriterionDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(1)
  @Max(100)
  maxPoints: number;
}

export class CreateChallengeDto {
  @IsString()
  unitId: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  difficulty?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  estimatedMinutes?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RubricCriterionDto)
  rubricCriteria?: RubricCriterionDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  successCriteria?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  contentTypes?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
