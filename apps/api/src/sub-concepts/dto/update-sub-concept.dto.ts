import { PartialType } from '@nestjs/swagger';

import { CreateSubConceptDto } from './create-sub-concept.dto';

export class UpdateSubConceptDto extends PartialType(CreateSubConceptDto) {}
