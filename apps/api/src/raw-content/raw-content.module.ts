import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RawContent } from './entities/raw-content.entity';
import { RawContentController } from './raw-content.controller';
import { RawContentService } from './raw-content.service';

@Module({
  imports: [TypeOrmModule.forFeature([RawContent])],
  controllers: [RawContentController],
  providers: [RawContentService],
  exports: [RawContentService],
})
export class RawContentModule {}
