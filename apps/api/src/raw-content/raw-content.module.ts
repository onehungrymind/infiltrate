import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RawContentService } from './raw-content.service';
import { RawContentController } from './raw-content.controller';
import { RawContent } from './entities/raw-content.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RawContent])],
  controllers: [RawContentController],
  providers: [RawContentService],
  exports: [RawContentService],
})
export class RawContentModule {}
