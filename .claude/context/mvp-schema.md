# Kasita MVP Data Model

**Last Updated**: January 5, 2026  
**Location**: `libs/common-models/src/lib/mvp-schema.ts`  
**Status**: Locked down for MVP

---

## Core Entities (5)

### 1. LearningPath
User's learning goal.

```typescript
interface LearningPath {
  id: string;
  userId: string;
  name: string;                    // "React Server Components"
  domain: string;                  // "Web Development"
  targetSkill: string;             // "Build production RSC app"
  status: PathStatus;              // 'not-started' | 'in-progress' | 'completed'
  createdAt: Date;
  updatedAt: Date;
}
```

**Relationships**:
- Has many KnowledgeUnits
- Has many SourceConfigs
- Has many RawContent items

---

### 2. SourceConfig
Content sources for ingestion.

```typescript
interface SourceConfig {
  id: string;
  pathId: string;                  // FK to LearningPath
  url: string;                     // "https://javascriptweekly.com/rss"
  type: SourceType;                // 'rss' | 'article' | 'pdf'
  name: string;                    // "JavaScript Weekly"
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

**Relationships**:
- Belongs to LearningPath

---

### 3. RawContent
Output from Patchbay ingestion.

```typescript
interface RawContent {
  id: string;
  pathId: string;                  // FK to LearningPath
  sourceType: string;              // "rss", "article"
  sourceUrl: string;
  title: string;
  content: string;                 // Clean extracted text
  author?: string;
  publishedDate?: Date;
  metadata: Record<string, any>;   // Source-specific data
  createdAt: Date;
  updatedAt: Date;
}
```

**Relationships**:
- Belongs to LearningPath
- Referenced by KnowledgeUnits (via sourceIds array)

---

### 4. KnowledgeUnit
Atomic learning block (flashcard).

```typescript
interface KnowledgeUnit {
  id: string;
  pathId: string;                  // FK to LearningPath
  
  // Core content
  concept: string;                 // "Server Components"
  question: string;                // "What are Server Components?"
  answer: string;                  // "Components that render on the server..."
  
  // Additional context
  elaboration?: string;            // Deeper explanation
  examples: string[];              // ["Example 1", "Example 2"]
  analogies: string[];             // ["Like a kitchen in a restaurant..."]
  commonMistakes: string[];        // ["Don't confuse with..."]
  
  // Classification
  difficulty: DifficultyLevel;     // 'beginner' | 'intermediate' | 'advanced' | 'expert'
  cognitiveLevel: CognitiveLevel;  // 'remember' | 'understand' | 'apply' | etc.
  estimatedTimeSeconds: number;    // 120 (2 minutes)
  
  // Metadata
  tags: string[];                  // ["react", "rsc", "nextjs"]
  sourceIds: string[];             // Links to RawContent IDs
  status: UnitStatus;              // 'pending' | 'approved' | 'rejected'
  
  createdAt: Date;
  updatedAt: Date;
}
```

**Relationships**:
- Belongs to LearningPath
- Has many UserProgress records
- References RawContent items

---

### 5. UserProgress
Tracks user's progress on a knowledge unit (SM-2 algorithm).

```typescript
interface UserProgress {
  id: string;
  userId: string;
  unitId: string;                  // FK to KnowledgeUnit
  
  // Mastery tracking
  masteryLevel: MasteryLevel;      // 'learning' | 'reviewing' | 'mastered'
  confidence: number;              // 0-100
  
  // SM-2 algorithm state
  easinessFactor: number;          // 1.3-2.5
  interval: number;                // Days until next review
  repetitions: number;             // Consecutive correct reviews
  nextReviewDate: Date;
  
  // History
  attempts: number;
  lastAttemptAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}
```

**Relationships**:
- Belongs to KnowledgeUnit
- Unique index on (userId, unitId)

---

## Entity Relationship Diagram

```
LearningPath
├── SourceConfigs (1:N)
├── RawContent (1:N)
└── KnowledgeUnits (1:N)
    └── UserProgress (1:N)
```

---

## DTOs

### Create DTOs

```typescript
CreateLearningPathDto {
  userId: string;
  name: string;
  domain: string;
  targetSkill: string;
}

CreateSourceConfigDto {
  pathId: string;
  url: string;
  type: SourceType;
  name: string;
}

CreateKnowledgeUnitDto {
  pathId: string;
  concept: string;
  question: string;
  answer: string;
  elaboration?: string;
  examples?: string[];
  analogies?: string[];
  commonMistakes?: string[];
  difficulty: DifficultyLevel;
  cognitiveLevel: CognitiveLevel;
  estimatedTimeSeconds?: number;
  tags?: string[];
  sourceIds?: string[];
}

RecordAttemptDto {
  userId: string;
  unitId: string;
  quality: number;  // 0-5 for SM-2 algorithm
}
```

### Update DTOs

All fields optional except where noted.

---

## Enums

```typescript
type DifficultyLevel = 
  | 'beginner' 
  | 'intermediate' 
  | 'advanced' 
  | 'expert';

type CognitiveLevel = 
  | 'remember'    // Recall facts
  | 'understand'  // Explain concepts
  | 'apply'       // Use in new situations
  | 'analyze'     // Break down and examine
  | 'evaluate'    // Make judgments
  | 'create';     // Produce new work

type MasteryLevel = 
  | 'learning'    // Initial learning phase
  | 'reviewing'   // In review cycle
  | 'mastered';   // Mastered

type SourceType = 
  | 'rss' 
  | 'article' 
  | 'pdf';

type UnitStatus = 
  | 'pending'     // Generated, awaiting review
  | 'approved'    // Reviewed and approved
  | 'rejected';   // Reviewed and rejected

type PathStatus = 
  | 'not-started' 
  | 'in-progress' 
  | 'completed';
```

---

## TypeORM Entity Example

```typescript
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

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

**Apply this pattern to all entities.**

---

## Validation Rules

### LearningPath
- name: required, non-empty
- domain: required, non-empty
- targetSkill: required, non-empty
- userId: required, non-empty

### KnowledgeUnit
- concept: required, non-empty
- question: required, non-empty, min 10 chars
- answer: required, non-empty, min 20 chars
- difficulty: must be valid DifficultyLevel
- cognitiveLevel: must be valid CognitiveLevel
- estimatedTimeSeconds: positive integer, default 120
- examples: array of strings
- tags: array of strings

### UserProgress
- userId: required
- unitId: required
- confidence: 0-100
- easinessFactor: 1.3-2.5
- interval: positive integer
- quality (in DTO): 0-5

---

## SM-2 Algorithm (Spaced Repetition)

When user rates a flashcard:

```typescript
function updateSM2(
  easinessFactor: number,
  interval: number,
  repetitions: number,
  quality: number  // 0-5 rating
): { easinessFactor, interval, repetitions, nextReviewDate } {
  
  // Calculate new easiness factor
  const newEF = Math.max(
    1.3, 
    easinessFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );
  
  // Calculate new interval and repetitions
  let newInterval: number;
  let newReps: number;
  
  if (quality < 3) {
    // Failed - restart
    newInterval = 1;
    newReps = 0;
  } else {
    if (repetitions === 0) {
      newInterval = 1;
    } else if (repetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * newEF);
    }
    newReps = repetitions + 1;
  }
  
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);
  
  return {
    easinessFactor: newEF,
    interval: newInterval,
    repetitions: newReps,
    nextReviewDate
  };
}
```

Implement in `apps/api/src/app/user-progress/sm2.service.ts`

---

## API Endpoints Generated

```
POST   /api/learning-paths
GET    /api/learning-paths
GET    /api/learning-paths/:id
PATCH  /api/learning-paths/:id
DELETE /api/learning-paths/:id

POST   /api/source-configs
GET    /api/source-configs
GET    /api/source-configs/:id
PATCH  /api/source-configs/:id
DELETE /api/source-configs/:id

POST   /api/raw-content
GET    /api/raw-content
GET    /api/raw-content/:id

POST   /api/knowledge-units
POST   /api/knowledge-units/bulk
GET    /api/knowledge-units
GET    /api/knowledge-units/:id
PATCH  /api/knowledge-units/:id
DELETE /api/knowledge-units/:id

POST   /api/user-progress/attempt
GET    /api/user-progress/due
GET    /api/user-progress/summary
```

---

## Important Notes for Cursor

1. **Import types from common-models**:
   ```typescript
   import { LearningPath, CreateLearningPathDto } from '@kasita/common-models';
   ```

2. **Arrays in TypeORM**: Use `'simple-array'` for string arrays:
   ```typescript
   @Column('simple-array')
   examples: string[];
   ```

3. **JSON in TypeORM**: Use `'simple-json'` for objects:
   ```typescript
   @Column('simple-json')
   metadata: Record<string, any>;
   ```

4. **Text fields**: Use `'text'` for long strings:
   ```typescript
   @Column('text')
   content: string;
   ```

5. **Validation**: Always use class-validator decorators in DTOs:
   ```typescript
   @IsString()
   @IsNotEmpty()
   name: string;
   ```

6. **Relationships**: Always define inverse side:
   ```typescript
   @ManyToOne(() => LearningPath, path => path.knowledgeUnits)
   learningPath: LearningPath;
   ```

---

## Migration Path to Full Schema

When ready to expand (post-MVP):
- Add Domain and Topic entities
- Upgrade examples: string[] → Example[]
- Add LearningPhase to LearningPath
- Add multiple ActivityTypes
- All changes will be additive (no breaking changes)

See `libs/common-models/src/lib/full-schema.ts` for complete vision.
