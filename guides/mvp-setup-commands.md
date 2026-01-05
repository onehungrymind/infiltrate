# Kasita MVP Setup - Step by Step

## Step 1: Update common-models Library

### 1.1: Backup and reorganize existing model

```bash
cd libs/common-models/src/lib

# Rename current comprehensive model to full-schema.ts
# (Adjust the filename if it's different)
mv common-models.ts full-schema.ts

# Create the MVP schema file
touch mvp-schema.ts
```

### 1.2: Copy MVP schema

Copy the contents of `mvp-schema.ts` (provided separately) into:
`libs/common-models/src/lib/mvp-schema.ts`

### 1.3: Update index.ts

```typescript
// libs/common-models/src/lib/index.ts

// MVP schema (current development)
export * from './mvp-schema';

// Full schema (reference for future)
// Uncomment to use full schema post-MVP
// export * from './full-schema';
```

### 1.4: Test the import

```bash
# Build the library
nx build common-models

# Should succeed with no errors
```

---

## Step 2: Install Dependencies

```bash
# TypeORM and database
npm install --save @nestjs/typeorm typeorm libsql

# Configuration
npm install --save @nestjs/config

# Validation
npm install --save class-validator class-transformer

# Swagger
npm install --save @nestjs/swagger

# WebSocket support
npm install --save @nestjs/websockets @nestjs/platform-socket.io socket.io
```

---

## Step 3: Generate Nest.js Resources

Run these commands to scaffold the API:

```bash
# Generate all 5 core resources
nx g @nestjs/schematics:resource learning-paths --project=api --no-spec && \
nx g @nestjs/schematics:resource source-configs --project=api --no-spec && \
nx g @nestjs/schematics:resource raw-content --project=api --no-spec && \
nx g @nestjs/schematics:resource knowledge-units --project=api --no-spec && \
nx g @nestjs/schematics:resource user-progress --project=api --no-spec

# When prompted:
# - Transport layer: REST API
# - Generate CRUD entry points: Yes

# Generate additional controllers/services
nx g @nestjs/schematics:controller --name=ingestion --sourceRoot=apps/api/src --no-spec 
nx g @nestjs/schematics:service --name=ingestion --sourceRoot=apps/api/src --no-spec 

# Generate WebSocket gateway
nx g @nestjs/schematics:gateway --name=progress --path=progress --sourceRoot=apps/api/src --no-spec 
```

**What this generates**:
- ✅ 5 complete REST resources (entities, controllers, services, DTOs, modules)
- ✅ Ingestion controller/service for triggering Python
- ✅ WebSocket gateway for real-time progress

---

## Step 4: Configure TypeORM

### 4.1: Update app.module.ts

Edit `apps/api/src/app/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { LearningPathsModule } from './learning-paths/learning-paths.module';
import { SourceConfigsModule } from './source-configs/source-configs.module';
import { RawContentModule } from './raw-content/raw-content.module';
import { KnowledgeUnitsModule } from './knowledge-units/knowledge-units.module';
import { UserProgressModule } from './user-progress/user-progress.module';
import { IngestionModule } from './ingestion/ingestion.module';
import { ProgressGateway } from './progress/progress.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'libsql',
      url: process.env.DATABASE_URL || 'file:./kasita.db',
      synchronize: process.env.NODE_ENV !== 'production', // Auto-sync in dev
      logging: process.env.NODE_ENV === 'development',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
    }),
    LearningPathsModule,
    SourceConfigsModule,
    RawContentModule,
    KnowledgeUnitsModule,
    UserProgressModule,
    IngestionModule,
  ],
  providers: [ProgressGateway],
})
export class AppModule {}
```

### 4.2: Update main.ts

Edit `apps/api/src/main.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api');

  // Enable CORS
  app.enableCors();

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  );

  // Setup Swagger
  const config = new DocumentBuilder()
    .setTitle('Kasita API')
    .setDescription('Knowledge Acquisition System API')
    .setVersion('1.0')
    .addTag('learning-paths')
    .addTag('knowledge-units')
    .addTag('user-progress')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3333;
  await app.listen(port);
  
  console.log(`🚀 API running on http://localhost:${port}/api`);
  console.log(`📚 Swagger docs at http://localhost:${port}/api/docs`);
}

bootstrap();
```

### 4.3: Create .env file

Create `apps/api/.env`:

```env
# Database
DATABASE_URL=file:./kasita.db
NODE_ENV=development

# API
PORT=3333

# Python services (for ingestion trigger)
PATCHBAY_PATH=../../apps/patchbay
SYNTHESIZER_PATH=../../apps/synthesizer
```

---

## Step 5: Convert Generated Entities to TypeORM

Now we need to add TypeORM decorators to each generated entity.

### 5.1: LearningPath Entity

Edit `apps/api/src/app/learning-paths/entities/learning-path.entity.ts`:

```typescript
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { KnowledgeUnit } from '../../knowledge-units/entities/knowledge-unit.entity';
import { SourceConfig } from '../../source-configs/entities/source-config.entity';
import { RawContent } from '../../raw-content/entities/raw-content.entity';

@Entity('learning_paths')
export class LearningPath {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  name: string;

  @Column()
  domain: string;

  @Column()
  targetSkill: string;

  @Column({ default: 'not-started' })
  status: string;

  @OneToMany(() => KnowledgeUnit, unit => unit.learningPath)
  knowledgeUnits: KnowledgeUnit[];

  @OneToMany(() => SourceConfig, source => source.learningPath)
  sources: SourceConfig[];

  @OneToMany(() => RawContent, content => content.learningPath)
  rawContent: RawContent[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### 5.2: SourceConfig Entity

Edit `apps/api/src/app/source-configs/entities/source-config.entity.ts`:

```typescript
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { LearningPath } from '../../learning-paths/entities/learning-path.entity';

@Entity('source_configs')
export class SourceConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  pathId: string;

  @ManyToOne(() => LearningPath, path => path.sources)
  learningPath: LearningPath;

  @Column()
  url: string;

  @Column()
  type: string; // 'rss' | 'article' | 'pdf'

  @Column()
  name: string;

  @Column({ default: true })
  enabled: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### 5.3: RawContent Entity

Edit `apps/api/src/app/raw-content/entities/raw-content.entity.ts`:

```typescript
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { LearningPath } from '../../learning-paths/entities/learning-path.entity';

@Entity('raw_content')
export class RawContent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  pathId: string;

  @ManyToOne(() => LearningPath, path => path.rawContent)
  learningPath: LearningPath;

  @Column()
  sourceType: string;

  @Column()
  sourceUrl: string;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column({ nullable: true })
  author: string;

  @Column({ nullable: true })
  publishedDate: Date;

  @Column('simple-json')
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### 5.4: KnowledgeUnit Entity

Edit `apps/api/src/app/knowledge-units/entities/knowledge-unit.entity.ts`:

```typescript
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { LearningPath } from '../../learning-paths/entities/learning-path.entity';
import { UserProgress } from '../../user-progress/entities/user-progress.entity';

@Entity('knowledge_units')
export class KnowledgeUnit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  pathId: string;

  @ManyToOne(() => LearningPath, path => path.knowledgeUnits)
  learningPath: LearningPath;

  @Column()
  concept: string;

  @Column('text')
  question: string;

  @Column('text')
  answer: string;

  @Column('text', { nullable: true })
  elaboration: string;

  @Column('simple-array')
  examples: string[];

  @Column('simple-array')
  analogies: string[];

  @Column('simple-array')
  commonMistakes: string[];

  @Column()
  difficulty: string; // 'beginner' | 'intermediate' | 'advanced' | 'expert'

  @Column()
  cognitiveLevel: string; // 'remember' | 'understand' | 'apply' | etc.

  @Column({ default: 120 })
  estimatedTimeSeconds: number;

  @Column('simple-array')
  tags: string[];

  @Column('simple-array')
  sourceIds: string[];

  @Column({ default: 'pending' })
  status: string; // 'pending' | 'approved' | 'rejected'

  @OneToMany(() => UserProgress, progress => progress.knowledgeUnit)
  userProgress: UserProgress[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### 5.5: UserProgress Entity

Edit `apps/api/src/app/user-progress/entities/user-progress.entity.ts`:

```typescript
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, Index } from 'typeorm';
import { KnowledgeUnit } from '../../knowledge-units/entities/knowledge-unit.entity';

@Entity('user_progress')
@Index(['userId', 'unitId'], { unique: true })
export class UserProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  unitId: string;

  @ManyToOne(() => KnowledgeUnit, unit => unit.userProgress)
  knowledgeUnit: KnowledgeUnit;

  @Column({ default: 'learning' })
  masteryLevel: string; // 'learning' | 'reviewing' | 'mastered'

  @Column({ default: 0 })
  confidence: number; // 0-100

  @Column('decimal', { precision: 3, scale: 2, default: 2.5 })
  easinessFactor: number; // 1.3-2.5

  @Column({ default: 1 })
  interval: number; // Days

  @Column({ default: 0 })
  repetitions: number;

  @Column()
  nextReviewDate: Date;

  @Column({ default: 0 })
  attempts: number;

  @Column({ nullable: true })
  lastAttemptAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

---

## Step 6: Update DTOs with Validation

### 6.1: CreateLearningPathDto

Edit `apps/api/src/app/learning-paths/dto/create-learning-path.dto.ts`:

```typescript
import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLearningPathDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'React Server Components' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Web Development' })
  @IsString()
  @IsNotEmpty()
  domain: string;

  @ApiProperty({ example: 'Build production RSC app' })
  @IsString()
  @IsNotEmpty()
  targetSkill: string;
}
```

### 6.2: CreateKnowledgeUnitDto

Edit `apps/api/src/app/knowledge-units/dto/create-knowledge-unit.dto.ts`:

```typescript
import { IsString, IsNotEmpty, IsArray, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateKnowledgeUnitDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  pathId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  concept: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  answer: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  elaboration?: string;

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsOptional()
  examples?: string[];

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsOptional()
  analogies?: string[];

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsOptional()
  commonMistakes?: string[];

  @ApiProperty({ enum: ['beginner', 'intermediate', 'advanced', 'expert'] })
  @IsEnum(['beginner', 'intermediate', 'advanced', 'expert'])
  difficulty: string;

  @ApiProperty({ enum: ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'] })
  @IsEnum(['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'])
  cognitiveLevel: string;

  @ApiProperty({ required: false, default: 120 })
  @IsNumber()
  @IsOptional()
  estimatedTimeSeconds?: number;

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsOptional()
  sourceIds?: string[];
}
```

**Do similar updates for**:
- `CreateSourceConfigDto`
- `CreateRawContentDto`
- `RecordAttemptDto`
- All UpdateDto files

---

## Step 7: Test the API

### 7.1: Start the API

```bash
nx serve api
```

You should see:
```
🚀 API running on http://localhost:3333/api
📚 Swagger docs at http://localhost:3333/api/docs
```

### 7.2: Test with Swagger

Open http://localhost:3333/api/docs

Try creating a learning path:
```json
{
  "userId": "user-1",
  "name": "React Server Components",
  "domain": "Web Development",
  "targetSkill": "Build production RSC app"
}
```

### 7.3: Test with curl

```bash
# Create learning path
curl -X POST http://localhost:3333/api/learning-paths \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-1",
    "name": "React Server Components",
    "domain": "Web Development",
    "targetSkill": "Build production RSC app"
  }'

# Get all learning paths
curl http://localhost:3333/api/learning-paths
```

---

## Step 8: Verify Database

```bash
# Check that database file was created
ls -la apps/api/kasita.db

# Optional: Use SQLite browser to inspect
sqlite3 apps/api/kasita.db
.tables
.schema learning_paths
.quit
```

You should see all 5 tables created:
- learning_paths
- source_configs
- raw_content
- knowledge_units
- user_progress

---

## Success Criteria

✅ API starts without errors  
✅ Swagger docs accessible at /api/docs  
✅ Can create/read learning paths via API  
✅ Database file created with all tables  
✅ TypeORM relationships working  

---

## Next Steps After API is Working

1. **Generate Angular services** (will provide commands)
2. **Generate NgRx state** (will provide commands)
3. **Build UI components** (will provide commands)
4. **Integrate Python apps** (will provide code)

Ready to run these commands? Let me know if you hit any issues!
