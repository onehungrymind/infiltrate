# Kasita MVP Setup Guide

**Quick Reference**: Commands to scaffold the MVP  
**Context**: See tech-stack.md and mvp-schema.md first

---

## Prerequisites

```bash
node --version        # 18+
python --version      # 3.11+
nx --version          # 19+

# Install if needed
npm install -g nx
pip install uv
```

---

## Part 1: Data Model Setup

### 1.1: Reorganize common-models

```bash
cd libs/common-models/src/lib

# Backup existing comprehensive model
mv common-models.ts full-schema.ts

# Create MVP schema
touch mvp-schema.ts
# Copy content from mvp-schema.md

# Update exports
cat > index.ts << 'EOF'
// MVP schema (current development)
export * from './mvp-schema';

// Full schema (future reference)
// export * from './full-schema';
EOF
```

### 1.2: Build common-models

```bash
cd ../../../../  # Back to root
nx build common-models
```

---

## Part 2: Install Dependencies

```bash
# TypeORM and database
npm install --save @nestjs/typeorm typeorm libsql

# Configuration and validation
npm install --save @nestjs/config class-validator class-transformer

# API documentation
npm install --save @nestjs/swagger

# WebSocket support
npm install --save @nestjs/websockets @nestjs/platform-socket.io socket.io

# Build to ensure clean install
nx run-many --target=build --all
```

---

## Part 3: Generate Nest.js Resources

### 3.1: Generate core resources

```bash
# Generate all 5 core resources
# When prompted: REST API, Generate CRUD = Yes

nx g @nestjs/schematics:resource learning-paths --project=api --no-spec
nx g @nestjs/schematics:resource source-configs --project=api --no-spec
nx g @nestjs/schematics:resource raw-content --project=api --no-spec
nx g @nestjs/schematics:resource knowledge-units --project=api --no-spec
nx g @nestjs/schematics:resource user-progress --project=api --no-spec
```

### 3.2: Generate additional services

```bash
# Ingestion controller/service
nx g @nestjs/schematics:controller ingestion --project=api --no-spec
nx g @nestjs/schematics:service ingestion --project=api --no-spec

# WebSocket gateway
nx g @nestjs/schematics:gateway progress --project=api --no-spec
```

---

## Part 4: Configure TypeORM

### 4.1: Update app.module.ts

```typescript
// apps/api/src/app/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'libsql',
      url: process.env.DATABASE_URL || 'file:./kasita.db',
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
    }),
    // Add all generated modules here
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

```typescript
// apps/api/src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableCors();
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  );

  const config = new DocumentBuilder()
    .setTitle('Kasita API')
    .setDescription('Knowledge Acquisition System API')
    .setVersion('1.0')
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

### 4.3: Create .env

```bash
# apps/api/.env
DATABASE_URL=file:./kasita.db
NODE_ENV=development
PORT=3333
```

---

## Part 5: Add TypeORM Decorators to Entities

**For each generated entity, add TypeORM decorators.**

### Example: LearningPath

```typescript
// apps/api/src/app/learning-paths/entities/learning-path.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { KnowledgeUnit } from '../../knowledge-units/entities/knowledge-unit.entity';

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**Repeat for all 5 entities** (see mvp-schema.md for complete entity definitions).

---

## Part 6: Add Validation to DTOs

### Example: CreateLearningPathDto

```typescript
// apps/api/src/app/learning-paths/dto/create-learning-path.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLearningPathDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  domain: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  targetSkill: string;
}
```

**Repeat for all DTOs**.

---

## Part 7: Test API

### 7.1: Start API

```bash
nx serve api
```

Expected output:
```
🚀 API running on http://localhost:3333/api
📚 Swagger docs at http://localhost:3333/api/docs
```

### 7.2: Test with Swagger

1. Open http://localhost:3333/api/docs
2. Test POST /api/learning-paths
3. Test GET /api/learning-paths

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

# Get all
curl http://localhost:3333/api/learning-paths
```

### 7.4: Verify database

```bash
ls -la apps/api/kasita.db
sqlite3 apps/api/kasita.db ".tables"
```

---

## Part 8: Generate Angular Services

### 8.1: Generate services

```bash
cd libs/core-data
nx g @schematics/angular:service learning-paths
nx g @schematics/angular:service knowledge-units
nx g @schematics/angular:service user-progress
nx g @schematics/angular:service ingestion
```

### 8.2: Implement pattern

```typescript
// libs/core-data/src/lib/learning-paths.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LearningPath, CreateLearningPathDto } from '@kasita/common-models';

@Injectable({ providedIn: 'root' })
export class LearningPathsService {
  private url = '/api/learning-paths';

  constructor(private http: HttpClient) {}

  findAll(userId: string): Observable<LearningPath[]> {
    return this.http.get<LearningPath[]>(`${this.url}?userId=${userId}`);
  }

  findOne(id: string): Observable<LearningPath> {
    return this.http.get<LearningPath>(`${this.url}/${id}`);
  }

  create(dto: CreateLearningPathDto): Observable<LearningPath> {
    return this.http.post<LearningPath>(this.url, dto);
  }

  update(id: string, dto: Partial<LearningPath>): Observable<LearningPath> {
    return this.http.patch<LearningPath>(`${this.url}/${id}`, dto);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
```

**Repeat pattern for all services**.

---

## Part 9: Generate NgRx State

### 9.1: Generate features

```bash
cd libs/core-state
nx g @ngrx/schematics:feature learning-paths --module=libs/core-state/src/index.ts
nx g @ngrx/schematics:feature knowledge-units --module=libs/core-state/src/index.ts
nx g @ngrx/schematics:feature user-progress --module=libs/core-state/src/index.ts
```

### 9.2: Wire up effects

```typescript
// Example effect
loadLearningPaths$ = createEffect(() =>
  this.actions$.pipe(
    ofType(LearningPathsActions.loadLearningPaths),
    mergeMap(action =>
      this.service.findAll(action.userId).pipe(
        map(paths => LearningPathsActions.loadLearningPathsSuccess({ paths })),
        catchError(error => of(LearningPathsActions.loadLearningPathsFailure({ error })))
      )
    )
  )
);
```

---

## Part 10: Generate Angular Components

### 10.1: Console components

```bash
cd apps/dashboard

# Learning paths
nx g @angular/material:table learning-paths-table
nx g @angular/material:form learning-path-form
nx g c learning-paths/learning-path-detail

# Knowledge units
nx g c knowledge-units/units-review
nx g c knowledge-units/unit-card
```

### 10.2: Infiltrate components

```bash
cd apps/infiltrate

nx g c flashcard/flashcard-deck
nx g c flashcard/flashcard
```

---

## Quick Commands Reference

```bash
# Start everything
nx serve api              # API on :3333
nx serve dashboard        # Console on :4200
nx serve infiltrate       # Infiltrate on :4201

# Build everything
nx run-many --target=build --all

# Test everything
nx run-many --target=test --all

# Lint everything
nx run-many --target=lint --all

# Generate Nest resource
nx g @nestjs/schematics:resource <name> --project=api --no-spec

# Generate Angular service
nx g @schematics/angular:service <name> --project=core-data

# Generate NgRx feature
nx g @ngrx/schematics:feature <name> --project=core-state

# Generate Angular component
nx g c <name> --project=dashboard
```

---

## Troubleshooting

### Issue: TypeORM entities not found
**Solution**: Check entities path in app.module.ts matches your structure

### Issue: Validation not working
**Solution**: Ensure ValidationPipe is configured in main.ts

### Issue: CORS errors
**Solution**: Verify `app.enableCors()` is called in main.ts

### Issue: Database file permission
**Solution**: Check write permissions in apps/api directory

### Issue: Module not found
**Solution**: Run `nx build common-models` first

---

## Success Checklist

After completing setup:

- [ ] API starts without errors
- [ ] Swagger docs accessible at /api/docs
- [ ] Can create learning path via API
- [ ] Can retrieve learning paths via API
- [ ] Database file created with tables
- [ ] Angular services generated
- [ ] NgRx state generated
- [ ] Components scaffolded

---

## Next Steps

1. Implement UI components (wire to state)
2. Add Python API client (httpx)
3. Update Patchbay to call API
4. Update Synthesizer to call API
5. Add WebSocket progress tracking
6. Test end-to-end flow

---

## Files to Reference

- Tech stack: `.claude/context/tech-stack.md`
- Data model: `.claude/context/mvp-schema.md`
- Architecture: `.claude/context/architecture.md`
- Cursor prompts: `.claude/context/cursor-prompt.md`
