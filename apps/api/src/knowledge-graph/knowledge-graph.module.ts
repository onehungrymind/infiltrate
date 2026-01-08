import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KnowledgeGraphController } from './knowledge-graph.controller';
import { KnowledgeGraphService } from './knowledge-graph.service';
import { GraphSearch } from './entities/graph-search.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GraphSearch])],
  controllers: [KnowledgeGraphController],
  providers: [KnowledgeGraphService],
  exports: [KnowledgeGraphService],
})
export class KnowledgeGraphModule {}
