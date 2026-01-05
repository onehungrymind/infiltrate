import { PartialType } from '@nestjs/swagger';
import { CreateKnowledgeUnitDto } from './create-knowledge-unit.dto';

export class UpdateKnowledgeUnitDto extends PartialType(CreateKnowledgeUnitDto) {}
