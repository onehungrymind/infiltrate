import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class LinkSourceDto {
  @ApiProperty({ required: false, default: true })
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;
}

export class UpdateSourceLinkDto {
  @ApiProperty()
  @IsBoolean()
  enabled: boolean;
}
