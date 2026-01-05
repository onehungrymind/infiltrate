# Kasita System Architecture

**Last Updated**: January 5, 2026  
**Status**: MVP Architecture

---

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
├────────────────────────────┬────────────────────────────────────┤
│   Console (Angular)        │   Infiltrate (Angular)             │
│   - Create learning paths  │   - Study flashcards               │
│   - Add sources            │   - Track progress                 │
│   - Review units           │   - Spaced repetition              │
│   - Trigger ingestion      │                                    │
└────────────┬───────────────┴─────────────────┬──────────────────┘
             │                                 │
             │         HTTP REST API           │
             └─────────────────┬───────────────┘
                              │
                    ┌─────────▼─────────┐
                    │   Nest.js API     │
                    │   (Port 3333)     │
                    │                   │
                    │ - REST endpoints  │
                    │ - WebSocket       │
                    │ - Validation      │
                    └─────────┬─────────┘
                              │
            ┌─────────────────┼─────────────────┐
            │                 │                 │
     ┌──────▼──────┐   ┌─────▼──────┐   ┌─────▼──────┐
     │  Triggers   │   │  Database  │   │  Triggers  │
     │  Patchbay   │   │  (Turso/   │   │Synthesizer │
     │  (Lambda)   │   │   Neon)    │   │  (Lambda)  │
     └──────┬──────┘   └────────────┘   └─────┬──────┘
            │                                  │
     ┌──────▼──────┐                    ┌─────▼──────┐
     │  Patchbay   │                    │Synthesizer │
     │  (Python)   │                    │  (Python)  │
     │             │                    │            │
     │ - Ingest    │                    │ - Embed    │
     │ - Extract   │                    │ - Cluster  │
     │ - Normalize │                    │ - Generate │
     └─────────────┘                    └────────────┘
```

---

## Component Details

### 1. Console (Angular Dashboard)

**Purpose**: Admin interface for managing learning paths.

**Features**:
- Create/edit learning paths
- Configure content sources (RSS, articles)
- Trigger content ingestion
- Review generated knowledge units
- Approve/reject/edit units
- View progress dashboard

**Stack**:
- Angular 21
- Angular Material UI
- Tailwind CSS
- NgRx for state
- RxJS for async

**Location**: `apps/dashboard/`

---

### 2. Infiltrate (Angular Learning App)

**Purpose**: Flashcard study application.

**Features (MVP)**:
- Phase 1: Memorization (flashcards)
- Spaced repetition (SM-2)
- Progress tracking
- Card flip animations
- Rating system (Hard/Good/Easy)

**Features (Post-MVP)**:
- Phase 2: Recitation (verbal practice)
- Phase 3: Performance (challenges)

**Stack**:
- Angular 21
- Angular Material UI
- Tailwind CSS
- NgRx for state

**Location**: `apps/infiltrate/`

---

### 3. Nest.js API

**Purpose**: Central REST API and orchestration layer.

**Responsibilities**:
- CRUD operations for all entities
- Authentication (future)
- Triggering Python services
- WebSocket for real-time updates
- Validation and business logic

**Endpoints**:
```
/api/learning-paths       - Learning path CRUD
/api/source-configs       - Source configuration CRUD
/api/raw-content          - Raw content from Patchbay
/api/knowledge-units      - Knowledge unit CRUD
/api/user-progress        - Progress tracking + SM-2
/api/ingestion/trigger    - Trigger Patchbay
/api/ingestion/synthesize - Trigger Synthesizer
/api/ingestion/status     - Check job status
```

**WebSocket**:
```
/socket.io                - Real-time progress updates
```

**Stack**:
- Nest.js 10
- TypeORM
- class-validator
- Swagger/OpenAPI
- Socket.io

**Location**: `apps/api/`

---

### 4. Database (Turso/Neon)

**Purpose**: Persistent data storage.

**Tables**:
- `learning_paths` - User learning goals
- `source_configs` - Content sources
- `raw_content` - Ingested content
- `knowledge_units` - Generated flashcards
- `user_progress` - SM-2 tracking

**Local Dev**: Turso (SQLite-compatible)  
**Production**: Neon.tech (Postgres)

**Vector Storage**: pgvector extension for embeddings

---

### 5. Patchbay (Python)

**Purpose**: Content ingestion from diverse sources.

**Flow**:
```
1. Receive sources list (RSS, articles, PDFs)
2. Route to appropriate adapter
3. Extract clean text content
4. Normalize to RawContent format
5. Upload to API → Database
6. Emit progress via WebSocket
```

**Adapters**:
- `rss_adapter.py` - RSS/Atom feeds (feedparser)
- `article_adapter.py` - Web articles (trafilatura)
- `pdf_adapter.py` - PDF documents (PyPDF2)
- `newsletter_adapter.py` - Email newsletters (future)

**Stack**:
- Python 3.11+
- httpx (async HTTP)
- feedparser (RSS)
- trafilatura (article extraction)
- PyPDF2 (PDF parsing)
- Pydantic (validation)

**Location**: `apps/patchbay/`

---

### 6. Synthesizer (Python)

**Purpose**: ML processing and knowledge unit generation.

**Flow**:
```
1. Fetch raw content from API
2. Generate embeddings (sentence-transformers)
3. Cluster by topic (sklearn K-means)
4. Generate knowledge units per cluster (Claude API)
5. Upload units to API → Database
6. Emit progress via WebSocket
```

**Processors**:
- `embeddings.py` - Generate vector embeddings
- `clustering.py` - Cluster similar content
- `summarization.py` - Extract key concepts
- `entity_extraction.py` - Extract entities (future)

**Generators**:
- `knowledge_unit_generator.py` - Create flashcards with Claude
- `quiz_generator.py` - Create quizzes (future)
- `challenge_generator.py` - Create coding challenges (future)

**Stack**:
- Python 3.11+
- Anthropic SDK (Claude API)
- sentence-transformers (embeddings)
- scikit-learn (clustering)
- numpy (linear algebra)

**Location**: `apps/synthesizer/`

---

## Data Flow

### Flow 1: Create Learning Path

```
User (Console) 
  → POST /api/learning-paths
  → API validates & saves to DB
  → Returns LearningPath
  → Console displays path
```

### Flow 2: Ingest Content

```
User (Console)
  → Adds sources (URLs)
  → POST /api/source-configs
  → Clicks "Ingest"
  → POST /api/ingestion/trigger
  → API invokes Lambda (Patchbay)
  
Patchbay (Python)
  → Fetches each source URL
  → Extracts clean text
  → POST /api/raw-content (batch)
  → Emits progress: POST /api/ingestion/progress
  
API
  → Saves raw content to DB
  → Broadcasts progress via WebSocket
  
Console
  → Receives WebSocket events
  → Updates progress bar
  → Shows "Ingestion complete"
```

### Flow 3: Synthesize Knowledge Units

```
User (Console)
  → Clicks "Synthesize"
  → POST /api/ingestion/synthesize
  → API invokes Lambda (Synthesizer)

Synthesizer (Python)
  → GET /api/raw-content?pathId=X
  → Generates embeddings
  → Clusters content (K-means)
  → For each cluster:
      → Calls Claude API
      → Generates 3-5 knowledge units
  → POST /api/knowledge-units/bulk
  → Emits progress via WebSocket

API
  → Saves units with status='pending'
  → Broadcasts completion

Console
  → Receives WebSocket event
  → Navigates to review page
```

### Flow 4: Review & Approve Units

```
User (Console)
  → GET /api/knowledge-units?status=pending
  → Views each unit
  → Clicks "Approve" or "Reject"
  → PATCH /api/knowledge-units/:id { status: 'approved' }
  → API updates DB
  → Approved units appear in Infiltrate
```

### Flow 5: Study Flashcards

```
User (Infiltrate)
  → Opens app
  → GET /api/user-progress/due?userId=X
  → API calculates due units (SM-2)
  → Returns units with nextReviewDate <= today
  
User
  → Sees flashcard
  → Flips card
  → Rates: Hard (2) / Good (4) / Easy (5)
  → POST /api/user-progress/attempt
  
API
  → Calculates new SM-2 values
  → Updates UserProgress
  → Returns next card
```

---

## Communication Patterns

### REST API (Synchronous)

```typescript
// Angular → API
this.http.get<LearningPath[]>('/api/learning-paths')

// Python → API
async with httpx.AsyncClient() as client:
    response = await client.post(
        f"{API_URL}/raw-content",
        json=data
    )
```

### WebSocket (Real-time)

```typescript
// API → Angular (Server push)
@WebSocketGateway()
export class ProgressGateway {
  @WebSocketServer()
  server: Server;
  
  emitProgress(pathId: string, data: any) {
    this.server.to(`path:${pathId}`).emit('progress', data);
  }
}

// Angular subscribes
socket.on('progress', (data) => {
  this.progress = data;
});
```

### File System (Backup/Cache)

```
Python writes to:
  data/raw/*.json
  data/synthesized/*.json

API can import from files if needed:
  POST /api/raw-content/import-file
```

---

## Security (Future)

### Authentication
- JWT tokens
- Passport.js strategies
- Refresh token rotation

### Authorization
- User owns their learning paths
- Can only see their own progress
- Admin role for content management

### API Rate Limiting
- Per-user request limits
- Python service rate limiting

---

## Deployment Architecture (Future)

```
┌─────────────────────────────────────────────────────────┐
│                     CloudFront CDN                      │
│                   (Static Assets)                       │
└────────┬───────────────────────────────────┬───────────┘
         │                                   │
    ┌────▼─────┐                       ┌────▼──────┐
    │    S3    │                       │    S3     │
    │ Console  │                       │ Infiltrate│
    └──────────┘                       └───────────┘
    
                    ┌──────────────┐
                    │   Route 53   │
                    │ api.kasita   │
                    └───────┬──────┘
                            │
                    ┌───────▼──────┐
                    │     ALB      │
                    │ Load Balancer│
                    └───────┬──────┘
                            │
                ┌───────────┴───────────┐
                │                       │
         ┌──────▼──────┐        ┌──────▼──────┐
         │  ECS Task   │        │  ECS Task   │
         │  (API 1)    │        │  (API 2)    │
         └──────┬──────┘        └──────┬──────┘
                │                       │
                └───────────┬───────────┘
                            │
                    ┌───────▼──────┐
                    │ Neon Postgres│
                    │  (Database)  │
                    └──────────────┘
                    
         ┌─────────────────────────────┐
         │      Lambda Functions       │
         ├──────────────┬──────────────┤
         │  Patchbay    │ Synthesizer  │
         └──────────────┴──────────────┘
```

---

## Scalability Considerations

### Stateless API
- No session state in API
- JWT tokens for auth
- Can scale horizontally

### Queue-Based Processing
- Future: Use SQS for Python jobs
- Decouple API from Python execution
- Better failure handling

### Caching
- Redis for session cache
- CloudFront for static assets
- Query result caching

### Database
- Read replicas for scaling reads
- Connection pooling
- Proper indexing

---

## Monitoring & Observability (Future)

```
Logging:
  - Winston (API)
  - Python logging (Patchbay/Synthesizer)
  - CloudWatch Logs

Metrics:
  - API response times
  - Database query performance
  - Lambda execution times
  - LLM API costs

Errors:
  - Sentry for error tracking
  - Alert on critical failures
  - Slack notifications

Analytics:
  - User engagement metrics
  - Learning path completion rates
  - Knowledge unit effectiveness
```

---

## Local Development

```bash
# Terminal 1: API
cd kasita
nx serve api

# Terminal 2: Console
nx serve dashboard

# Terminal 3: Infiltrate
nx serve infiltrate

# Terminal 4: Database (Turso)
turso dev --port 8080

# Terminal 5: Python (when needed)
cd apps/patchbay
source ../../.venv/bin/activate
python src/main.py ingest <path-id> <sources-file>
```

---

## Key Architectural Decisions

### Why Separate Python Apps?
- ML/AI libraries are Python-native
- Data processing is faster in Python
- Embeddings generation requires Python

### Why Not Microservices?
- MVP doesn't need that complexity
- Nx monorepo provides modularity
- Easier to develop and deploy

### Why TypeORM over Prisma?
- More flexible for complex queries
- Better support for migrations
- Works with both SQLite and Postgres

### Why WebSockets?
- Real-time progress updates
- Better UX during long-running jobs
- Low overhead for simple messages

### Why Lambda for Python?
- Pay per execution (cost-effective)
- Auto-scaling
- No server management
- Perfect for batch jobs

---

## Notes for Cursor

- API is the single source of truth for data
- Python apps are stateless workers
- Angular apps never talk directly to Python
- All async operations emit progress via WebSocket
- File system is backup/cache only, not primary storage
- Database auto-syncs schema in development (synchronize: true)
