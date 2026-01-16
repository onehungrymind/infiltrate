import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class ValidationResultDto {
  @IsString()
  exercise: string;

  @IsNumber()
  completed: number; // 0 or 1

  @IsArray()
  @IsString({ each: true })
  errors: string[];
}

export class SubmitNotebookDto {
  @IsString()
  @IsNotEmpty()
  notebookId: string;

  @IsString()
  @IsNotEmpty()
  notebookCode: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsArray()
  @IsNumber({}, { each: true })
  completedExercises: number[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ValidationResultDto)
  validationResults?: ValidationResultDto[];
}
