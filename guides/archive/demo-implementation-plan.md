# Kasita Demo Implementation Plan

This document outlines the comprehensive plan to get Kasita into a working demo state with two milestones.

## Current State Analysis

### ✅ What's Working
- **API Structure**: NestJS API with all CRUD endpoints for core entities ✅
- **Database Setup**: TypeORM with SQLite, entities defined, seeder service ready ✅
- **Angular Apps**: Dashboard and Infiltrate apps created with full structure ✅
- **HTTP Services**: Generated for all entities in `core-data` ✅
- **NgRx Features**: Generated actions, effects, facades, and reducers for all entities ✅
- **Master-Detail Views**: Generated for all entities in dashboard ✅
- **NgRx Store**: Fully configured in both Angular apps ✅
- **Routing**: Routes defined and working in both apps ✅
- **Authentication**: JWT authentication with Passport.js, guards, and user management ✅
- **Users Module**: Complete CRUD operations, role-based access control (guest, user, manager, admin) ✅
- **Data Sources Module**: Global content source management with scheduling support ✅
- **Knowledge Graph Module**: Relationship queries, graph generation, and visualization ✅
- **Graph Visualization**: Three.js, Cytoscape.js, and D3.js implementations ✅
- **Dynamic Forms**: Field definitions-based form generation ✅
- **Python Services**: Patchbay and Synthesizer with basic structure ✅

### 🔄 In Progress
- **Python-API Bridge**: Patchbay and Synthesizer integration with API database (partially complete)
- **Ingestion Endpoint**: Ingestion controller implementation (basic structure exists)

### ❌ What's Missing
- **Full Ingestion Pipeline**: End-to-end flow from Patchbay → API → Synthesizer → API → Dashboard
- **WebSocket Integration**: Real-time progress updates during ingestion/processing
- **Advanced Analytics**: Dashboard analytics and insights
- **Whiteboard Interface**: Challenge interface for recitation phase

---

## Milestone 1: Working Demo with Mock Data ✅ COMPLETED

**Goal**: Get the application running locally and displaying data, even if static/mock data.

**Status**: ✅ All phases completed

### Phase 1.1: NgRx Store Configuration ✅

#### Tasks:
1. **Configure NgRx Store in Dashboard** ✅
   - ✅ Add `provideStore()` to `app.config.ts`
   - ✅ Add `provideState()` for each feature (learning-paths, knowledge-units, raw-content, source-configs, user-progress, users)
   - ✅ Add `provideEffects()` for all effects
   - ✅ Import `StoreDevtoolsModule` for development

2. **Configure NgRx Store in Infiltrate** ✅
   - ✅ Same setup as dashboard

3. **Verify Store Connection** ✅
   - ✅ Components read from store
   - ✅ Facades dispatch actions and read state

#### Files Modified:
- ✅ `apps/dashboard/src/app/app.config.ts`
- `apps/infiltrate/src/app/app.config.ts`

#### Estimated Time: 2-3 hours

---

### Phase 1.2: Routing Setup ✅

#### Tasks:
1. **Create Dashboard Routes** ✅
   - ✅ `/` - Home page (or redirect to learning-paths)
   - ✅ `/learning-paths` - Master-detail view
   - ✅ `/knowledge-units` - Master-detail view
   - ✅ `/raw-content` - Master-detail view
   - ✅ `/source-configs` - Master-detail view
   - ✅ `/user-progress` - Master-detail view
   - ✅ `/users` - User management (added)
   - ✅ `/login` - Login page (added)
   - ✅ `/graph` - Knowledge graph visualization (added)

2. **Create Infiltrate Routes** ✅
   - ✅ `/` - Flashcard view (main app)
   - ✅ `/progress` - Progress dashboard (optional)

3. **Add Router Outlet** ✅
   - ✅ Updated `app.html` in both apps to include `<router-outlet>`

#### Files Modified:
- ✅ `apps/dashboard/src/app/app.routes.ts`
- ✅ `apps/infiltrate/src/app/app.routes.ts`
- ✅ `apps/dashboard/src/app/app.html`
- ✅ `apps/infiltrate/src/app/app.html`

#### Estimated Time: 1-2 hours (Completed)

---

### Phase 1.3: Connect Components to NgRx ✅

#### Tasks:
1. **Update Master-Detail Components** ✅
   - ✅ All components are using facades correctly
   - ✅ `loadAll()` calls are dispatching actions
   - ✅ Components receive data from observables

2. **API Integration** ✅
   - ✅ HTTP services connected to API
   - ✅ Effects trigger HTTP calls
   - ✅ Store updates from API responses

3. **Test Data Flow** ✅
   - ✅ Component → Facade → Action → Effect → Service → Store → Component
   - ✅ All entities work (learning-paths, knowledge-units, raw-content, source-configs, user-progress, users)

#### Files Modified:
- ✅ `apps/dashboard/src/app/*/` (all master-detail components)
- ✅ HTTP services in `libs/core-data/src/lib/services/`

#### Estimated Time: 4-5 hours (Completed)

---

### Phase 1.4: Authentication Implementation ✅

#### Tasks:
1. **Create Auth Service** ✅
   - ✅ JWT-based authentication
   - ✅ Login/register endpoints
   - ✅ Token storage in localStorage

2. **Create Auth Guard** ✅
   - ✅ Route protection with JWT guard
   - ✅ Backend Passport.js JWT strategy

3. **Create Login Component** ✅
   - ✅ Login form with validation
   - ✅ JWT token handling
   - ✅ HTTP interceptor for tokens

4. **Add User Management** ✅
   - ✅ Users CRUD operations
   - ✅ Role-based access control (guest, user, manager, admin)
   - ✅ User profile management

#### Files Created:
- ✅ `libs/core-data/src/lib/services/auth.service.ts`
- ✅ `libs/core-data/src/lib/guards/auth.guard.ts`
- ✅ `apps/dashboard/src/app/login/login.component.ts`
- ✅ `apps/api/src/auth/` (auth module with JWT strategy)
- ✅ `apps/api/src/users/` (users module)

#### Estimated Time: 3-4 hours (Completed - Full JWT implementation)

---

### Phase 1.5: Database Seeding and API Testing ✅

#### Tasks:
1. **Seed Database** ✅
   - ✅ Run seeder: `POST /api/seed`
   - ✅ Verify data exists in database

2. **Test API Endpoints** ✅
   - ✅ Use Swagger UI at `/api/docs`
   - ✅ Test all CRUD operations for each entity
   - ✅ Verify CORS is working

3. **Connect Angular to Real API** ✅
   - ✅ HTTP services connected to real API
   - ✅ Data loads from API

4. **Additional API Modules** ✅
   - ✅ Users API endpoints
   - ✅ Data Sources API endpoints
   - ✅ Knowledge Graph API endpoints

#### Files Modified:
- ✅ HTTP services in `libs/core-data/src/lib/services/`
- ✅ All API endpoints working

#### Estimated Time: 2-3 hours (Completed)

---

### Phase 1.6: UI Polish and Navigation ✅

#### Tasks:
1. **Add Navigation** ✅
   - ✅ Header/navbar component
   - ✅ Sidebar navigation component
   - ✅ Links to all routes
   - ✅ Logout button

2. **Add Loading States** ✅
   - ✅ Loading indicators when data is fetching
   - ✅ Error states handling

3. **Basic Styling** ✅
   - ✅ Material components render correctly
   - ✅ Tailwind CSS integration
   - ✅ Basic layout (header, sidebar, content area)

4. **Additional UI Features** ✅
   - ✅ Dynamic form generation from field definitions
   - ✅ Knowledge graph visualization (Three.js, Cytoscape.js, D3.js)
   - ✅ User management UI
   - ✅ Data sources management UI

#### Files Modified:
- ✅ `apps/dashboard/src/app/shared/header/header.component.*`
- ✅ `apps/dashboard/src/app/shared/sidebar/sidebar.component.*`
- ✅ Master-detail components (loading states added)
- ✅ `apps/dashboard/src/app/pages/graph/` (graph visualization)

#### Estimated Time: 3-4 hours (Completed + additional features)

---

## Milestone 1 Summary ✅ COMPLETED

**Total Estimated Time: 15-21 hours**
**Actual Completion: All phases completed + additional features**

**Success Criteria:**
- ✅ Dashboard loads and displays all entities (learning-paths, knowledge-units, raw-content, source-configs, user-progress, users, data-sources)
- ✅ Data comes from seeded database via API
- ✅ Can navigate between different views
- ✅ Can view/edit details of each entity with dynamic forms
- ✅ Full JWT authentication works (not mock)
- ✅ All CRUD operations work via UI
- ✅ User management with roles (guest, user, manager, admin)
- ✅ Knowledge graph visualization implemented
- ✅ Data sources management working

---

## Milestone 2: Ingestion Pipeline Integration 🔄 IN PROGRESS

**Goal**: Patchbay ingests data, Synthesizer processes it, and results appear in the frontend.

**Status**: Basic structure in place, full integration pending

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

