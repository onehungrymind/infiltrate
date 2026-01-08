import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateGraphDto {
  @ApiProperty({ example: 'React Server Components' })
  @IsString()
  @IsNotEmpty()
  topic: string;
}
