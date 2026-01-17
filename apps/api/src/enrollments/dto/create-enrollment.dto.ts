import { IsNotEmpty, IsOptional, IsString, IsIn } from 'class-validator';

export class CreateEnrollmentDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  pathId: string;

  @IsOptional()
  @IsString()
  mentorId?: string;

  @IsOptional()
  @IsIn(['active', 'completed', 'dropped'])
  status?: 'active' | 'completed' | 'dropped';
}
