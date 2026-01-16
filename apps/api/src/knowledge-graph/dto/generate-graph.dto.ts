import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty,IsString } from 'class-validator';

export class GenerateGraphDto {
  @ApiProperty({ example: 'React Server Components' })
  @IsString()
  @IsNotEmpty()
  topic: string;
}
