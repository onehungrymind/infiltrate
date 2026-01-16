import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional,IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ required: false, example: 'user' })
  @IsOptional()
  @IsString()
  role?: string;
}

