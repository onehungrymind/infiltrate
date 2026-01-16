import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { KnowledgeUnit } from './entities/knowledge-unit.entity';
import { KnowledgeUnitsController } from './knowledge-units.controller';
import { KnowledgeUnitsService } from './knowledge-units.service';

@Module({
  imports: [TypeOrmModule.forFeature([KnowledgeUnit])],
  controllers: [KnowledgeUnitsController],
  providers: [KnowledgeUnitsService],
  exports: [KnowledgeUnitsService],
})
export class KnowledgeUnitsModule {}
