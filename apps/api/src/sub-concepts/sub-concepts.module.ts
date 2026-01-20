import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SubConcept } from './entities/sub-concept.entity';
import { SubConceptDecoration } from './entities/sub-concept-decoration.entity';
import { SubConceptsController } from './sub-concepts.controller';
import { SubConceptsService } from './sub-concepts.service';

@Module({
  imports: [TypeOrmModule.forFeature([SubConcept, SubConceptDecoration])],
  controllers: [SubConceptsController],
  providers: [SubConceptsService],
  exports: [SubConceptsService],
})
export class SubConceptsModule {}
