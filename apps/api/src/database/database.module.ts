import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Challenge } from '../challenges/entities/challenge.entity';
import { DataSource } from '../data-sources/entities/data-source.entity';
import { KnowledgeUnit } from '../knowledge-units/entities/knowledge-unit.entity';
import { LearningPath } from '../learning-paths/entities/learning-path.entity';
import { Principle } from '../principles/entities/principle.entity';
import { Project } from '../projects/entities/project.entity';
import { RawContent } from '../raw-content/entities/raw-content.entity';
import { Source } from '../source-configs/entities/source.entity';
import { SourcePathLink } from '../source-configs/entities/source-path-link.entity';
import { Feedback } from '../submissions/entities/feedback.entity';
import { Submission } from '../submissions/entities/submission.entity';
import { UserProgress } from '../user-progress/entities/user-progress.entity';
import { User } from '../users/entities/user.entity';
import { SeedController } from './seed.controller';
import { SeederService } from './seeder.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LearningPath,
      KnowledgeUnit,
      Principle,
      RawContent,
      Source,
      SourcePathLink,
      UserProgress,
      User,
      DataSource,
      Challenge,
      Project,
      Submission,
      Feedback,
    ]),
  ],
  controllers: [SeedController],
  providers: [SeederService],
  exports: [SeederService],
})
export class DatabaseModule {}
