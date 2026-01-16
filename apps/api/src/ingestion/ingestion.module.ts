import { Module } from '@nestjs/common';

import { KnowledgeUnitsModule } from '../knowledge-units/knowledge-units.module';
import { RawContentModule } from '../raw-content/raw-content.module';
import { IngestionController } from './ingestion.controller';
import { IngestionService } from './ingestion.service';

@Module({
  imports: [RawContentModule, KnowledgeUnitsModule],
  controllers: [IngestionController],
  providers: [IngestionService],
})
export class IngestionModule {}

