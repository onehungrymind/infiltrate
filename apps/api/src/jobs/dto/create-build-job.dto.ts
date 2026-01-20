import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBuildJobDto {
  @IsString()
  @IsNotEmpty()
  pathId: string;
}
