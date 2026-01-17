import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

import { AuthModule } from '../auth/auth.module';
import { ChallengesModule } from '../challenges/challenges.module';
import { Challenge } from '../challenges/entities/challenge.entity';
import { DataSourcesModule } from '../data-sources/data-sources.module';
import { DataSource } from '../data-sources/entities/data-source.entity';
import { DatabaseModule } from '../database/database.module';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { EnrollmentsModule } from '../enrollments/enrollments.module';
import { IngestionModule } from '../ingestion/ingestion.module';
import { GraphSearch } from '../knowledge-graph/entities/graph-search.entity';
import { KnowledgeGraphModule } from '../knowledge-graph/knowledge-graph.module';
import { KnowledgeUnit } from '../knowledge-units/entities/knowledge-unit.entity';
import { KnowledgeUnitsModule } from '../knowledge-units/knowledge-units.module';
import { LearningMapModule } from '../learning-map/learning-map.module';
import { LearningPath } from '../learning-paths/entities/learning-path.entity';
import { LearningPathsModule } from '../learning-paths/learning-paths.module';
import { NotebookProgress } from '../notebooks/entities/notebook-progress.entity';
import { NotebooksModule } from '../notebooks/notebooks.module';
import { Principle } from '../principles/entities/principle.entity';
import { PrinciplesModule } from '../principles/principles.module';
import { ProgressGateway } from '../progress/progress.gateway';
import { Project } from '../projects/entities/project.entity';
import { ProjectPrinciple } from '../projects/entities/project-principle.entity';
import { ProjectsModule } from '../projects/projects.module';
import { RawContent } from '../raw-content/entities/raw-content.entity';
import { RawContentModule } from '../raw-content/raw-content.module';
import { Source } from '../source-configs/entities/source.entity';
import { SourcePathLink } from '../source-configs/entities/source-path-link.entity';
import { SourceConfigsModule } from '../source-configs/source-configs.module';
import { Feedback } from '../submissions/entities/feedback.entity';
import { Submission } from '../submissions/entities/submission.entity';
import { SubmissionsModule } from '../submissions/submissions.module';
import { UserProgress } from '../user-progress/entities/user-progress.entity';
import { UserProgressModule } from '../user-progress/user-progress.module';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        join(process.cwd(), 'apps/api/.env'), // Workspace root relative
        join(process.cwd(), '.env'), // Workspace root .env
        '.env', // fallback to process.cwd()
      ],
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.DATABASE_URL?.replace('file:', '') || 'kasita.db',
      synchronize: process.env.NODE_ENV !== 'production', // Auto-sync in dev
      logging: false, // Disable SQL logging for better performance
      entities: [LearningPath, Source, SourcePathLink, RawContent, KnowledgeUnit, UserProgress, User, DataSource, GraphSearch, NotebookProgress, Principle, Submission, Feedback, Challenge, Project, ProjectPrinciple, Enrollment],
    }),
    LearningPathsModule,
    SourceConfigsModule,
    RawContentModule,
    KnowledgeUnitsModule,
    UserProgressModule,
    IngestionModule,
    DatabaseModule,
    AuthModule,
    UsersModule,
    DataSourcesModule,
    KnowledgeGraphModule,
    NotebooksModule,
    LearningMapModule,
    PrinciplesModule,
    SubmissionsModule,
    ChallengesModule,
    ProjectsModule,
    EnrollmentsModule,
  ],
  controllers: [AppController],
  providers: [AppService, ProgressGateway],
})
export class AppModule {}
