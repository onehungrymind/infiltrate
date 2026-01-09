import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotebooksController } from './notebooks.controller';
import { NotebooksService } from './notebooks.service';
import { NotebookProgress } from './entities/notebook-progress.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NotebookProgress])],
  controllers: [NotebooksController],
  providers: [NotebooksService],
  exports: [NotebooksService],
})
export class NotebooksModule {}
