import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString, Max,Min, ValidateNested } from 'class-validator';

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

export class LinkPrincipleDto {
  @IsString()
  principleId: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  weight: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RubricCriterionDto)
  rubricCriteria?: RubricCriterionDto[];
}

export class UpdateProjectPrincipleDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  weight?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RubricCriterionDto)
  rubricCriteria?: RubricCriterionDto[];
}
