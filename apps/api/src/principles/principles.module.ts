import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Principle } from './entities/principle.entity';
import { PrinciplesController } from './principles.controller';
import { PrinciplesService } from './principles.service';

@Module({
  imports: [TypeOrmModule.forFeature([Principle])],
  controllers: [PrinciplesController],
  providers: [PrinciplesService],
})
export class PrinciplesModule {}
