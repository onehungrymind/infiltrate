import { PartialType } from '@nestjs/swagger';
import { CreateSourceConfigDto } from './create-source-config.dto';

export class UpdateSourceConfigDto extends PartialType(CreateSourceConfigDto) {}
