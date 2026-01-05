import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KnowledgeUnitsService } from './knowledge-units.service';
import { KnowledgeUnitsController } from './knowledge-units.controller';
import { KnowledgeUnit } from './entities/knowledge-unit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([KnowledgeUnit])],
  controllers: [KnowledgeUnitsController],
  providers: [KnowledgeUnitsService],
})
export class KnowledgeUnitsModule {}
