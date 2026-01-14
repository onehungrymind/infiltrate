import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LearningPathsModule } from '../learning-paths/learning-paths.module';
import { SourceConfigsModule } from '../source-configs/source-configs.module';
import { RawContentModule } from '../raw-content/raw-content.module';
import { KnowledgeUnitsModule } from '../knowledge-units/knowledge-units.module';
import { UserProgressModule } from '../user-progress/user-progress.module';
import { IngestionModule } from '../ingestion/ingestion.module';
import { ProgressGateway } from '../progress/progress.gateway';
import { DatabaseModule } from '../database/database.module';
import { LearningPath } from '../learning-paths/entities/learning-path.entity';
import { SourceConfig } from '../source-configs/entities/source-config.entity';
import { RawContent } from '../raw-content/entities/raw-content.entity';
import { KnowledgeUnit } from '../knowledge-units/entities/knowledge-unit.entity';
import { UserProgress } from '../user-progress/entities/user-progress.entity';
import { User } from '../users/entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { DataSourcesModule } from '../data-sources/data-sources.module';
import { DataSource } from '../data-sources/entities/data-source.entity';
import { KnowledgeGraphModule } from '../knowledge-graph/knowledge-graph.module';
import { GraphSearch } from '../knowledge-graph/entities/graph-search.entity';
import { NotebooksModule } from '../notebooks/notebooks.module';
import { NotebookProgress } from '../notebooks/entities/notebook-progress.entity';
import { LearningMapModule } from '../learning-map/learning-map.module';
import { PrinciplesModule } from '../principles/principles.module';
import { Principle } from '../principles/entities/principle.entity';

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
      entities: [LearningPath, SourceConfig, RawContent, KnowledgeUnit, UserProgress, User, DataSource, GraphSearch, NotebookProgress, Principle],
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
  ],
  controllers: [AppController],
  providers: [AppService, ProgressGateway],
})
export class AppModule {}
