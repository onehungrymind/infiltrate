import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
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
import { Session } from '../gymnasium/entities/session.entity';
import { SessionTemplate } from '../gymnasium/entities/session-template.entity';
import { GymnasiumModule } from '../gymnasium/gymnasium.module';
import { IngestionModule } from '../ingestion/ingestion.module';
import { BuildJob } from '../jobs/entities/build-job.entity';
import { JobStep } from '../jobs/entities/job-step.entity';
import { JobsModule } from '../jobs/jobs.module';
import { GraphSearch } from '../knowledge-graph/entities/graph-search.entity';
import { KnowledgeGraphModule } from '../knowledge-graph/knowledge-graph.module';
import { KnowledgeUnit } from '../knowledge-units/entities/knowledge-unit.entity';
import { KnowledgeUnitsModule } from '../knowledge-units/knowledge-units.module';
import { LearningMapModule } from '../learning-map/learning-map.module';
import { LearningPath } from '../learning-paths/entities/learning-path.entity';
import { LearningPathsModule } from '../learning-paths/learning-paths.module';
import { NotebookProgress } from '../notebooks/entities/notebook-progress.entity';
import { NotebooksModule } from '../notebooks/notebooks.module';
import { Concept } from '../concepts/entities/concept.entity';
import { ConceptsModule } from '../concepts/concepts.module';
import { ProgressGateway } from '../progress/progress.gateway';
import { Project } from '../projects/entities/project.entity';
import { ProjectConcept } from '../projects/entities/project-concept.entity';
import { ProjectsModule } from '../projects/projects.module';
import { RawContent } from '../raw-content/entities/raw-content.entity';
import { RawContentModule } from '../raw-content/raw-content.module';
import { Source } from '../source-configs/entities/source.entity';
import { SourcePathLink } from '../source-configs/entities/source-path-link.entity';
import { SourceConfigsModule } from '../source-configs/source-configs.module';
import { SubConcept } from '../sub-concepts/entities/sub-concept.entity';
import { SubConceptDecoration } from '../sub-concepts/entities/sub-concept-decoration.entity';
import { SubConceptsModule } from '../sub-concepts/sub-concepts.module';
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
    EventEmitterModule.forRoot(),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.DATABASE_URL?.replace('file:', '') || 'kasita.db',
      synchronize: process.env.NODE_ENV !== 'production', // Auto-sync in dev
      logging: false, // Disable SQL logging for better performance
      entities: [LearningPath, Source, SourcePathLink, RawContent, KnowledgeUnit, UserProgress, User, DataSource, GraphSearch, NotebookProgress, Concept, Submission, Feedback, Challenge, Project, ProjectConcept, Enrollment, Session, SessionTemplate, SubConcept, SubConceptDecoration, BuildJob, JobStep],
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
    ConceptsModule,
    SubmissionsModule,
    ChallengesModule,
    ProjectsModule,
    EnrollmentsModule,
    GymnasiumModule,
    SubConceptsModule,
    JobsModule,
  ],
  controllers: [AppController],
  providers: [AppService, ProgressGateway],
})
export class AppModule {}
