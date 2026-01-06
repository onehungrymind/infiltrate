# Kasita Demo Implementation Plan

This document outlines the comprehensive plan to get Kasita into a working demo state with two milestones.

## Current State Analysis

### ✅ What's Working
- **API Structure**: NestJS API with all CRUD endpoints for core entities
- **Database Setup**: TypeORM with SQLite, entities defined, seeder service ready
- **Angular Apps**: Dashboard and Infiltrate apps created with basic structure
- **HTTP Services**: Generated for all entities in `core-data`
- **NgRx Features**: Generated actions, effects, facades, and reducers for all entities
- **Master-Detail Views**: Generated for all entities in dashboard
- **Python Services**: Patchbay and Synthesizer with basic structure

### ❌ What's Missing
- **NgRx Store**: Not configured in Angular apps (no `provideStore`, `provideState`, `provideEffects`)
- **Routing**: No routes defined in either Angular app
- **Authentication**: No auth guards, JWT, or user management
- **NgRx Integration**: Facades not being used in components
- **API Integration**: Components using facades but effects not triggering HTTP calls
- **Python-API Bridge**: Patchbay and Synthesizer need to sync with API database
- **Ingestion Endpoint**: Ingestion controller is empty, needs implementation

---

## Milestone 1: Working Demo with Mock Data

**Goal**: Get the application running locally and displaying data, even if static/mock data.

### Phase 1.1: NgRx Store Configuration

#### Tasks:
1. **Configure NgRx Store in Dashboard**
   - Add `provideStore()` to `app.config.ts`
   - Add `provideState()` for each feature (learning-paths, knowledge-units, raw-content, source-configs, user-progress)
   - Add `provideEffects()` for all effects
   - Import `StoreDevtoolsModule` for development

2. **Configure NgRx Store in Infiltrate**
   - Same setup as dashboard

3. **Verify Store Connection**
   - Create a simple component that reads from store
   - Test that facades can dispatch actions and read state

#### Files to Modify:
- `apps/dashboard/src/app/app.config.ts`
- `apps/infiltrate/src/app/app.config.ts`

#### Estimated Time: 2-3 hours

---

### Phase 1.2: Routing Setup

#### Tasks:
1. **Create Dashboard Routes**
   - `/` - Home page (or redirect to learning-paths)
   - `/learning-paths` - Master-detail view
   - `/knowledge-units` - Master-detail view
   - `/raw-content` - Master-detail view
   - `/source-configs` - Master-detail view
   - `/user-progress` - Master-detail view

2. **Create Infiltrate Routes**
   - `/` - Flashcard view (main app)
   - `/progress` - Progress dashboard (optional)

3. **Add Router Outlet**
   - Update `app.html` in both apps to include `<router-outlet>`

#### Files to Modify:
- `apps/dashboard/src/app/app.routes.ts`
- `apps/infiltrate/src/app/app.routes.ts`
- `apps/dashboard/src/app/app.html`
- `apps/infiltrate/src/app/app.html`

#### Estimated Time: 1-2 hours

---

### Phase 1.3: Connect Components to NgRx

#### Tasks:
1. **Update Master-Detail Components**
   - Ensure all components are using facades correctly
   - Verify `loadAll()` calls are dispatching actions
   - Test that components receive data from observables

2. **Create Mock Data Service** (Temporary)
   - Create a mock service that returns hardcoded data
   - Use this to test NgRx flow without API dependency

3. **Test Data Flow**
   - Component → Facade → Action → Effect → Service → Store → Component
   - Verify all entities work (learning-paths, knowledge-units, etc.)

#### Files to Modify:
- `apps/dashboard/src/app/*/` (all master-detail components)
- Create `libs/core-data/src/lib/services/mock.service.ts` (temporary)

#### Estimated Time: 4-5 hours

---

### Phase 1.4: Basic Authentication (Mock)

#### Tasks:
1. **Create Auth Service**
   - Simple mock auth that returns a user object
   - No JWT or real auth - just a hardcoded user

2. **Create Auth Guard**
   - Protect routes (can use simple check)

3. **Create Login Component**
   - Simple form that "logs in" with any credentials
   - Stores user in localStorage or service

4. **Add User Context**
   - Use a default user ID for all operations
   - Update API calls to include `userId`

#### Files to Create:
- `libs/core-data/src/lib/services/auth.service.ts`
- `libs/core-data/src/lib/guards/auth.guard.ts`
- `apps/dashboard/src/app/login/login.component.ts`

#### Estimated Time: 3-4 hours

---

### Phase 1.5: Database Seeding and API Testing

#### Tasks:
1. **Seed Database**
   - Run seeder: `POST /api/seed`
   - Verify data exists in database

2. **Test API Endpoints**
   - Use Swagger UI at `/api/docs`
   - Test all CRUD operations for each entity
   - Verify CORS is working

3. **Connect Angular to Real API**
   - Replace mock service with real HTTP services
   - Test that data loads from API

#### Files to Modify:
- Remove mock service
- Verify HTTP services work

#### Estimated Time: 2-3 hours

---

### Phase 1.6: UI Polish and Navigation

#### Tasks:
1. **Add Navigation**
   - Create a header/navbar component
   - Add links to all routes
   - Add logout button

2. **Add Loading States**
   - Show loading indicators when data is fetching
   - Handle error states

3. **Basic Styling**
   - Ensure Material components render correctly
   - Add basic layout (header, content area)

#### Files to Modify:
- `apps/dashboard/src/app/components/header/header.component.*`
- Master-detail components (add loading states)

#### Estimated Time: 3-4 hours

---

## Milestone 1 Summary

**Total Estimated Time: 15-21 hours**

**Success Criteria:**
- ✅ Dashboard loads and displays all 5 entities (learning-paths, knowledge-units, raw-content, source-configs, user-progress)
- ✅ Data comes from seeded database via API
- ✅ Can navigate between different views
- ✅ Can view details of each entity
- ✅ Basic authentication works (mock)
- ✅ All CRUD operations work via UI

---

## Milestone 2: Ingestion Pipeline Integration

**Goal**: Patchbay ingests data, Synthesizer processes it, and results appear in the frontend.

### Phase 2.1: Patchbay-API Integration

#### Tasks:
1. **Create API Endpoint for Raw Content Ingestion**
   - `POST /api/ingestion/raw-content` - Accept raw content from Patchbay
   - `POST /api/ingestion/batch` - Accept batch of raw content
   - Link raw content to learning paths via `pathId`

2. **Update Patchbay to Call API**
   - After extracting content, POST to API instead of just writing files
   - Handle API errors gracefully
   - Still write files as backup

3. **Create Source Config API Integration**
   - Patchbay should fetch active source configs from API
   - Use `GET /api/source-configs?enabled=true`

#### Files to Modify:
- `apps/api/src/ingestion/ingestion.controller.ts`
- `apps/api/src/ingestion/ingestion.service.ts`
- `apps/patchbay/src/main.py` or router
- `apps/patchbay/adapters/*.py` (update to call API)

#### Estimated Time: 4-5 hours

---

### Phase 2.2: Synthesizer-API Integration

#### Tasks:
1. **Create API Endpoint for Knowledge Units**
   - `POST /api/ingestion/knowledge-units` - Accept generated knowledge units
   - `POST /api/ingestion/knowledge-units/batch` - Accept batch
   - Link knowledge units to learning paths and raw content

2. **Update Synthesizer to Call API**
   - After generating knowledge units, POST to API
   - Map synthesized format to API DTO format
   - Handle relationships (pathId, sourceIds)

3. **Add Processing Status Tracking**
   - Track ingestion status in database
   - Add endpoints to check processing status

#### Files to Modify:
- `apps/api/src/ingestion/ingestion.controller.ts`
- `apps/api/src/ingestion/ingestion.service.ts`
- `apps/synthesizer/src/orchestrator.py`
- `apps/synthesizer/generators/knowledge_unit_generator.py`

#### Estimated Time: 5-6 hours

---

### Phase 2.3: End-to-End Pipeline Testing

#### Tasks:
1. **Create Test Learning Path**
   - Create a learning path via API or UI
   - Create source configs for it

2. **Run Patchbay**
   - Execute: `nx run patchbay:ingest`
   - Verify raw content appears in database
   - Verify raw content visible in dashboard

3. **Run Synthesizer**
   - Execute: `nx run synthesizer:process`
   - Verify knowledge units appear in database
   - Verify knowledge units visible in dashboard

4. **Test Full Flow**
   - Source Config → Patchbay → Raw Content → Synthesizer → Knowledge Units
   - Verify all data flows correctly
   - Check relationships are maintained

#### Files to Test:
- End-to-end integration

#### Estimated Time: 3-4 hours

---

### Phase 2.4: Real Authentication Setup

#### Tasks:
1. **Implement JWT Authentication**
   - Install `@nestjs/jwt` and `@nestjs/passport`
   - Create auth module with login endpoint
   - Create JWT strategy

2. **Update Angular Auth**
   - Replace mock auth with real JWT auth
   - Store JWT in localStorage
   - Add JWT to HTTP headers via interceptor

3. **Protect API Endpoints**
   - Add `@UseGuards(JwtAuthGuard)` to protected endpoints
   - Make `/seed` public (for development)

4. **User Management**
   - Create users table/entity
   - Add registration endpoint (optional)
   - Use `userId` from JWT token

#### Files to Create/Modify:
- `apps/api/src/auth/` (new auth module)
- `libs/core-data/src/lib/interceptors/auth.interceptor.ts`
- `libs/core-data/src/lib/services/auth.service.ts` (update)
- All API controllers (add guards)

#### Estimated Time: 6-8 hours

---

### Phase 2.5: Polish and Error Handling

#### Tasks:
1. **Add Error Handling**
   - Global error handler in Angular
   - API error response formatting
   - User-friendly error messages

2. **Add Processing Indicators**
   - Show when ingestion is running
   - Progress indicators for long operations
   - Status badges for ingestion state

3. **Add WebSocket Integration** (Optional)
   - Use ProgressGateway for real-time updates
   - Show ingestion progress in UI

4. **Documentation**
   - Update README with setup instructions
   - Add API documentation
   - Create demo walkthrough

#### Files to Modify:
- Error handling throughout
- `apps/dashboard/src/app/*` (add status indicators)

#### Estimated Time: 4-5 hours

---

## Milestone 2 Summary

**Total Estimated Time: 22-28 hours**

**Success Criteria:**
- ✅ Patchbay successfully ingests content from RSS feeds/articles
- ✅ Raw content appears in database and dashboard
- ✅ Synthesizer processes raw content and generates knowledge units
- ✅ Knowledge units appear in database and dashboard
- ✅ Full pipeline works end-to-end
- ✅ Real authentication protects API endpoints
- ✅ Frontend displays processed data correctly

---

## Overall Timeline

**Milestone 1: 15-21 hours** (2-3 days)
**Milestone 2: 22-28 hours** (3-4 days)
**Total: 37-49 hours** (5-7 days)

---

## Quick Start Commands

### Milestone 1 Setup:
```bash
# Start API
nx serve api

# Seed database
curl -X POST http://localhost:3333/api/seed

# Start Dashboard
nx serve dashboard

# Start Infiltrate (optional)
nx serve infiltrate
```

### Milestone 2 Setup:
```bash
# Start API
nx serve api

# Run Patchbay
nx run patchbay:ingest

# Run Synthesizer
nx run synthesizer:process

# View results in dashboard
nx serve dashboard
```

---

## Critical Dependencies

### Required Before Starting:
- ✅ Node.js 18+
- ✅ Python 3.11+ with uv installed
- ✅ Database seeder working
- ✅ All npm packages installed
- ✅ Python dependencies installed

### Optional but Recommended:
- Anthropic API key (for Synthesizer)
- Test RSS feeds for Patchbay
- Postman or similar for API testing

---

## Risk Areas

1. **NgRx Configuration**: Most complex part of Milestone 1, may need debugging
2. **Python-API Integration**: Different languages, need careful serialization
3. **Data Format Mismatches**: Synthesizer output vs API DTO format
4. **Authentication**: JWT setup can be tricky, consider starting with simple mock
5. **CORS Issues**: Make sure API CORS is configured correctly

---

## Next Steps After Demo

1. **Performance Optimization**
   - Pagination for large datasets
   - Caching strategies
   - Lazy loading

2. **Enhanced Features**
   - Real-time updates via WebSockets
   - Search and filtering
   - Export/import functionality

3. **Production Readiness**
   - Environment configuration
   - Error logging and monitoring
   - Database migrations
   - Deployment setup

---

*This plan is a living document and should be updated as implementation progresses.*

