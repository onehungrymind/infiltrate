# Kasita Technology Stack

**Last Updated**: January 5, 2026  
**Status**: Finalized for MVP

---

## Core Stack

```
Frontend:  Angular 21 + NgRx + Angular Material + Tailwind CSS
Backend:   Nest.js + TypeORM + Passport.js
Database:  Turso (local dev) → Neon.tech (production)
Python:    uv + shared venv + Anthropic/OpenAI SDKs
ML/AI:     sentence-transformers + pgvector + Claude Sonnet 4
Monorepo:  Nx + npm
Testing:   Jest + Vitest + Playwright + pytest
Deploy:    AWS ECS (API) + Lambda (Python) + S3
CI/CD:     GitHub Actions
Quality:   Biome + ESLint + Ruff + Black + MyPy
```

---

## Key Decisions & Rationale

### Database
- **Local**: Turso (libSQL) - Postgres-compatible SQLite
- **Production**: Neon.tech - Serverless Postgres (~$5-15/month)
- **ORM**: TypeORM (not Prisma)
- **Vector Search**: pgvector extension (no separate vector DB)

**Why**: Cost optimization, TypeORM flexibility, no separate vector DB to manage.

### Python Stack
- **Package Manager**: uv (fastest)
- **Venv Strategy**: Shared venv at monorepo root (`.venv/`)
- **LLM**: Claude Sonnet 4 (primary) + GPT-4 (fallback)
- **Embeddings**: sentence-transformers/all-MiniLM-L6-v2 (free, local)

**Why**: Fast installs, simple setup, multi-model strategy, zero API costs for embeddings.

### Python ↔ TypeScript Integration
- **Strategy**: HTTP API calls
- Python apps call Nest.js endpoints via httpx
- Nest.js stores everything in database
- Angular apps read from API
- WebSockets for real-time progress updates

**Why**: Clean separation, language-agnostic, easy to deploy.

### Angular State Management
- **State**: NgRx (Redux pattern)
- **UI**: Angular Material
- **Styling**: Tailwind CSS
- **Version**: Angular 21 (latest)

**Why**: Existing setup, scales well, team familiarity.

### Type Synchronization
- **Source of Truth**: TypeScript interfaces in `libs/common-models`
- **Strategy**: Manual sync between TS and Python for MVP
- **Future**: OpenAPI → code generation

**Why**: Simplest for MVP, can automate later.

---

## Project Structure

```
kasita/
├── apps/
│   ├── api/              # Nest.js REST API
│   ├── dashboard/        # Angular console (admin)
│   ├── infiltrate/       # Angular flashcard app
│   ├── patchbay/         # Python content ingestion
│   └── synthesizer/      # Python ML processing
├── libs/
│   ├── common-models/    # Shared TypeScript types
│   ├── python-shared/    # Shared Python utilities
│   ├── core-data/        # Angular HTTP services
│   ├── core-state/       # NgRx state management
│   └── material/         # Angular Material config
├── data/                 # File-based storage (backup)
│   ├── raw/             # Patchbay output
│   ├── processed/       # Intermediate
│   └── synthesized/     # Knowledge units
└── .venv/               # Shared Python virtual environment
```

---

## Data Flow

```
1. User adds sources in Console (Angular)
2. Console calls API → triggers Lambda (Python Patchbay)
3. Patchbay ingests content → saves to API → Database
4. API triggers Lambda (Python Synthesizer)
5. Synthesizer processes → generates units → saves to API → Database
6. Console fetches units from API → user reviews
7. User studies in Infiltrate (Angular) → progress saved to API
```

---

## Development Workflow

```bash
# Start API
nx serve api              # http://localhost:3333

# Start Console
nx serve dashboard        # http://localhost:4200

# Start Infiltrate
nx serve infiltrate       # http://localhost:4201

# Python ingestion (manual for MVP)
cd apps/patchbay
source ../../.venv/bin/activate
python src/main.py ingest <path-id> <sources-file>

# Python synthesis (manual for MVP)
cd apps/synthesizer
source ../../.venv/bin/activate
python src/main.py process <path-id>
```

---

## Environment Variables

### API (.env)
```env
DATABASE_URL=file:./kasita.db  # or Neon connection string
NODE_ENV=development
PORT=3333
```

### Python Apps
```env
API_URL=http://localhost:3333/api
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
```

---

## Deployment (Future)

### API
- AWS ECS Fargate (always-on service)
- Docker container from Nest.js build
- Connected to Neon Postgres

### Python
- AWS Lambda functions (pay-per-invoke)
- Triggered by API endpoints
- Package with dependencies

### Angular Apps
- Static builds deployed to S3 + CloudFront
- Or Vercel/Netlify for simplicity

---

## Cost Estimates (MVP)

```
Database (Neon):        $0-5/month   (free tier)
API (ECS):              $15-20/month (1 task)
Python (Lambda):        $0-5/month   (low usage)
S3:                     $1-3/month   (artifacts)
LLM APIs:               $20-50/month (testing)
───────────────────────────────────────────────
Total:                  ~$40-85/month

With AWS free tier:     ~$10-30/month (first year)
```

---

## Dependencies

### TypeScript/Node
```json
{
  "@nestjs/typeorm": "^10.x",
  "typeorm": "^0.3.x",
  "libsql": "^0.3.x",
  "@nestjs/config": "^3.x",
  "class-validator": "^0.14.x",
  "@nestjs/swagger": "^7.x",
  "@nestjs/websockets": "^10.x",
  "socket.io": "^4.x"
}
```

### Python
```toml
[project]
dependencies = [
  "anthropic>=0.39.0",
  "openai>=1.0.0",
  "httpx>=0.25.0",
  "pydantic>=2.5.0",
  "sentence-transformers>=2.2.0",
  "feedparser>=6.0.10",
  "trafilatura>=1.6.0"
]
```

---

## Quick Reference

### Generate Nest.js Resource
```bash
nx g @nestjs/schematics:resource <name> --project=api --no-spec
```

### Generate Angular Service
```bash
nx g @schematics/angular:service <name> --project=core-data
```

### Generate NgRx Feature
```bash
nx g @ngrx/schematics:feature <name> --project=core-state
```

### Build All
```bash
nx run-many --target=build --all
```

### Test All
```bash
nx run-many --target=test --all
```

---

## Notes for Cursor

- All TypeScript types are in `libs/common-models/src/lib/mvp-schema.ts`
- Python apps write to API, not directly to database
- WebSocket gateway is in `apps/api/src/app/progress/progress.gateway.ts`
- Shared Python utilities are in `libs/python-shared/src/python_shared/`
- Use `@kasita/common-models` to import types
- Always use TypeORM decorators for entities
- Always use class-validator decorators for DTOs
