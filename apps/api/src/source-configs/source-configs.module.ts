import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SourceConfigsService } from './source-configs.service';
import { SourceConfigsController } from './source-configs.controller';
import { SourceConfig } from './entities/source-config.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SourceConfig])],
  controllers: [SourceConfigsController],
  providers: [SourceConfigsService],
})
export class SourceConfigsModule {}
