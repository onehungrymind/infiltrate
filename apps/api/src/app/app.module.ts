import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.DATABASE_URL?.replace('file:', '') || 'kasita.db',
      synchronize: process.env.NODE_ENV !== 'production', // Auto-sync in dev
      logging: process.env.NODE_ENV === 'development',
      entities: [LearningPath, SourceConfig, RawContent, KnowledgeUnit, UserProgress, User],
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
  ],
  controllers: [AppController],
  providers: [AppService, ProgressGateway],
})
export class AppModule {}
