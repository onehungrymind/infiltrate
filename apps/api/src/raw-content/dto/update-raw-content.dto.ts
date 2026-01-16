import { PartialType } from '@nestjs/swagger';

import { CreateRawContentDto } from './create-raw-content.dto';

export class UpdateRawContentDto extends PartialType(CreateRawContentDto) {}
