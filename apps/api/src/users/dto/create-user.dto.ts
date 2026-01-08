import { IsString, IsNotEmpty, IsEmail, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ 
    enum: ['guest', 'user', 'manager', 'admin'], 
    example: 'user', 
    required: false,
    default: 'user'
  })
  @IsEnum(['guest', 'user', 'manager', 'admin'])
  @IsOptional()
  role?: string;
}
