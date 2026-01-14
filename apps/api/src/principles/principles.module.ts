import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrinciplesService } from './principles.service';
import { PrinciplesController } from './principles.controller';
import { Principle } from './entities/principle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Principle])],
  controllers: [PrinciplesController],
  providers: [PrinciplesService],
})
export class PrinciplesModule {}
