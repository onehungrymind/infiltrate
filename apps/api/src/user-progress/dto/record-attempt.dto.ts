import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Max,Min } from 'class-validator';

export class RecordAttemptDto {
  @ApiProperty({ description: 'The user ID' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: 'The knowledge unit ID' })
  @IsString()
  @IsNotEmpty()
  unitId: string;

  @ApiProperty({
    description: 'Quality of recall (0-5 scale): 0=blackout, 1-2=incorrect, 3=hard, 4=good, 5=easy',
    minimum: 0,
    maximum: 5,
  })
  @IsNumber()
  @Min(0)
  @Max(5)
  quality: number;
}
