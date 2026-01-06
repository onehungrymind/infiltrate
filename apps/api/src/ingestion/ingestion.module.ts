import { Module } from '@nestjs/common';
import { IngestionController } from './ingestion.controller';
import { IngestionService } from './ingestion.service';
import { RawContentModule } from '../raw-content/raw-content.module';
import { KnowledgeUnitsModule } from '../knowledge-units/knowledge-units.module';

@Module({
  imports: [RawContentModule, KnowledgeUnitsModule],
  controllers: [IngestionController],
  providers: [IngestionService],
})
export class IngestionModule {}

