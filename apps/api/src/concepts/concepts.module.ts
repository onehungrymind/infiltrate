import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Concept } from './entities/concept.entity';
import { ConceptsController } from './concepts.controller';
import { ConceptsService } from './concepts.service';

@Module({
  imports: [TypeOrmModule.forFeature([Concept])],
  controllers: [ConceptsController],
  providers: [ConceptsService],
})
export class ConceptsModule {}
