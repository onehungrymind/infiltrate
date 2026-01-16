import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserProgress } from './entities/user-progress.entity';
import { UserProgressController } from './user-progress.controller';
import { UserProgressService } from './user-progress.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserProgress])],
  controllers: [UserProgressController],
  providers: [UserProgressService],
})
export class UserProgressModule {}
