import { IsOptional, IsNumber, IsString, IsUUID, IsBoolean, IsArray, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ContentListQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsUUID()
  learningPathId?: string;

  @IsOptional()
  @IsUUID()
  conceptId?: string;
}

export class UpdateContentDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsArray()
  sections?: any[];
}

export class GenerateForPathDto {
  @IsOptional()
  @IsBoolean()
  force?: boolean = false;
}

export class GenerateForSubConceptDto {
  @IsOptional()
  @IsString()
  conceptName?: string;

  @IsOptional()
  @IsUUID()
  conceptId?: string;

  @IsOptional()
  @IsUUID()
  learningPathId?: string;
}
