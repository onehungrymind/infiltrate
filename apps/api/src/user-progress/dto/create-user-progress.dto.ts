import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserProgressDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  unitId: string;

  @ApiProperty({ enum: ['learning', 'reviewing', 'mastered'], required: false, default: 'learning' })
  @IsEnum(['learning', 'reviewing', 'mastered'])
  @IsOptional()
  masteryLevel?: string;

  @ApiProperty({ required: false, default: 0, minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  confidence?: number;

  @ApiProperty({ required: false, default: 2.5, minimum: 1.3, maximum: 2.5 })
  @IsNumber()
  @Min(1.3)
  @Max(2.5)
  @IsOptional()
  easinessFactor?: number;

  @ApiProperty({ required: false, default: 1 })
  @IsNumber()
  @IsOptional()
  interval?: number;

  @ApiProperty({ required: false, default: 0 })
  @IsNumber()
  @IsOptional()
  repetitions?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  nextReviewDate?: string;
}
