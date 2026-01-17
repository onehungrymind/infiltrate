import { IsOptional, IsIn, IsDateString, IsString, ValidateIf } from 'class-validator';

export class UpdateEnrollmentDto {
  @IsOptional()
  @IsIn(['active', 'completed', 'dropped'])
  status?: 'active' | 'completed' | 'dropped';

  @IsOptional()
  @ValidateIf((o) => o.mentorId !== null)
  @IsString()
  mentorId?: string | null;

  @IsOptional()
  @IsDateString()
  completedAt?: string;
}
