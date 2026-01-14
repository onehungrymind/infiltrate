# Kasita Demo Implementation Checklist

Quick reference checklist for getting Kasita to a working demo state.

## Milestone 1: Working Demo with Mock Data ⏱️ COMPLETED ✅

### Phase 1.1: NgRx Store Configuration ✅
- [x] Install `@ngrx/store`, `@ngrx/effects`, `@ngrx/store-devtools`
- [x] Add `provideStore()` to dashboard `app.config.ts`
- [x] Add `provideState()` for each feature:
  - [x] `learningPathsFeature`
  - [x] `knowledgeUnitsFeature`
  - [x] `rawContentFeature`
  - [x] `sourceConfigsFeature`
  - [x] `userProgressFeature`
  - [x] `usersFeature` (added)
- [x] Add `provideEffects()` with all effects
- [x] Add `StoreDevtoolsModule` for development
- [x] Repeat for infiltrate app
- [x] Test store connection in components

### Phase 1.2: Routing Setup ✅
- [x] Create routes in dashboard `app.routes.ts`:
  - [x] `/` → home or redirect to learning-paths
  - [x] `/learning-paths` → LearningPaths component
  - [x] `/knowledge-units` → KnowledgeUnits component
  - [x] `/raw-content` → RawContent component
  - [x] `/source-configs` → SourceConfigs component
  - [x] `/user-progress` → UserProgress component
  - [x] `/users` → Users component (added)
  - [x] `/login` → Login component (added)
  - [x] `/graph` → Knowledge graph visualization (added)
- [x] Create routes in infiltrate `app.routes.ts`
- [x] Add `<router-outlet>` to both app templates
- [x] Test navigation between routes

### Phase 1.3: Connect Components to NgRx ✅
- [x] Verify all master-detail components inject facades
- [x] Ensure `loadAll()` is called in `ngOnInit`
- [x] Test that observables receive data
- [x] Test full NgRx flow with API data
- [x] Verify all entities work correctly (including users)

### Phase 1.4: Authentication Implementation ✅
- [x] Create `auth.service.ts` with JWT authentication
- [x] Create `auth.guard.ts` to protect routes
- [x] Create login component in dashboard
- [x] Add login route (`/login`)
- [x] JWT token storage in localStorage
- [x] HTTP interceptor for JWT tokens
- [x] Backend JWT authentication (Passport.js)

### Phase 1.5: Database Seeding and API ✅
- [x] Start API server: `nx serve api`
- [x] Seed database: `POST http://localhost:3333/api/seed`
- [x] Verify data in database file
- [x] Test API endpoints in Swagger: `http://localhost:3333/api/docs`
- [x] HTTP services connected to API
- [x] Test data loads from API in dashboard
- [x] Users API endpoints (CRUD)
- [x] Data Sources API endpoints (CRUD)
- [x] Knowledge Graph API endpoints

### Phase 1.6: UI Polish ✅
- [x] Create/update header component with navigation
- [x] Create sidebar navigation component
- [x] Add loading states to components
- [x] Add error handling
- [x] Add basic styling/layout (Tailwind CSS)
- [x] Test all CRUD operations via UI
- [x] Dynamic form components with field definitions
- [x] Knowledge graph visualization (Three.js, Cytoscape.js, D3.js)

**Milestone 1 Success Criteria:**
- ✅ Dashboard loads and displays all entities (including users, data sources)
- ✅ Data comes from API
- ✅ Can navigate between views
- ✅ Can view/edit details with dynamic forms
- ✅ Real JWT authentication works
- ✅ Knowledge graph visualization implemented

---

## Milestone 2: Ingestion Pipeline ⏱️ 22-28 hours

### Phase 2.1: Patchbay-API Integration (4-5h)
- [ ] Implement `POST /api/ingestion/raw-content` endpoint
- [ ] Implement `POST /api/ingestion/batch` endpoint
- [ ] Update Patchbay to fetch source configs from API
- [ ] Update Patchbay to POST raw content to API
- [ ] Test Patchbay ingestion flow
- [ ] Verify raw content appears in dashboard

### Phase 2.2: Synthesizer-API Integration (5-6h)
- [ ] Implement `POST /api/ingestion/knowledge-units` endpoint
- [ ] Implement `POST /api/ingestion/knowledge-units/batch` endpoint
- [ ] Map Synthesizer output to API DTO format
- [ ] Update Synthesizer to POST knowledge units to API
- [ ] Handle relationships (pathId, sourceIds)
- [ ] Test Synthesizer → API flow

### Phase 2.3: End-to-End Pipeline (3-4h)
- [ ] Create test learning path via API/UI
- [ ] Create source configs for learning path
- [ ] Run Patchbay: `nx run patchbay:ingest`
- [ ] Verify raw content in database/dashboard
- [ ] Run Synthesizer: `nx run synthesizer:process`
- [ ] Verify knowledge units in database/dashboard
- [ ] Test full pipeline end-to-end

### Phase 2.4: Real Authentication ✅ COMPLETED
- [x] Install `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`
- [x] Create auth module with login endpoint
- [x] Create JWT strategy and guard
- [x] Update Angular auth service to use JWT
- [x] Create HTTP interceptor for JWT tokens
- [x] Protect API endpoints with `@UseGuards(JwtAuthGuard)`
- [x] Test authentication flow
- [x] Create users table/entity with roles
- [x] Role-based access control (RBAC)
- [x] User management UI (CRUD)

### Phase 2.5: Polish and Error Handling (In Progress)
- [x] Add global error handler in Angular
- [x] Format API error responses
- [x] Add user-friendly error messages
- [ ] Add processing status indicators (for ingestion pipeline)
- [ ] Integrate WebSocket for real-time updates (optional)
- [x] Update documentation

### Phase 2.6: Additional Features Implemented ✅
- [x] Data Sources module (global content source management)
- [x] Knowledge Graph module (relationship queries and visualization)
- [x] Graph visualization with multiple renderers (Three.js, Cytoscape.js, D3.js)
- [x] User roles and permissions (guest, user, manager, admin)
- [x] Dynamic form generation from field definitions
- [x] Master-detail views for all entities

**Milestone 2 Success Criteria:**
- [ ] Patchbay ingests content → database (pending integration)
- [ ] Synthesizer processes → knowledge units → database (pending integration)
- ✅ Data visible in dashboard
- [ ] Full pipeline works end-to-end (in progress)
- ✅ Real JWT authentication protects API
- ✅ Knowledge graph visualization working
- ✅ User management complete

---

## Quick Commands Reference

```bash
# Start Services
nx serve api                    # API on http://localhost:3333
nx serve dashboard              # Dashboard on http://localhost:4200
nx serve infiltrate             # Infiltrate on http://localhost:4201

# Database
curl -X POST http://localhost:3333/api/seed              # Seed database
curl -X POST http://localhost:3333/api/seed/clear        # Clear database

# Python Services
nx run patchbay:ingest          # Ingest content
nx run synthesizer:process      # Process content

# API Docs
open http://localhost:3333/api/docs  # Swagger UI
```

---

## Key Files to Modify

### Milestone 1:
- `apps/dashboard/src/app/app.config.ts` - Add NgRx providers
- `apps/dashboard/src/app/app.routes.ts` - Add routes
- `apps/infiltrate/src/app/app.config.ts` - Add NgRx providers
- `apps/infiltrate/src/app/app.routes.ts` - Add routes
- `libs/core-data/src/lib/services/auth.service.ts` - Create mock auth
- `libs/core-data/src/lib/guards/auth.guard.ts` - Create guard

### Milestone 2:
- `apps/api/src/ingestion/ingestion.controller.ts` - Add endpoints
- `apps/api/src/ingestion/ingestion.service.ts` - Implement logic
- `apps/patchbay/src/main.py` - Add API calls
- `apps/synthesizer/src/orchestrator.py` - Add API calls
- `apps/api/src/auth/` - Create auth module

---

## Critical Issues to Watch

1. **NgRx State Not Updating**: Check effects are registered and services are injected
2. **CORS Errors**: Verify API has `app.enableCors()` in `main.ts`
3. **401 Unauthorized**: Check JWT token is being sent in headers
4. **Python API Calls Fail**: Verify API URL and request format matches DTOs
5. **Data Not Appearing**: Check relationships (pathId, userId) are set correctly

---

*Use the detailed plan in `demo-implementation-plan.md` for comprehensive guidance.*

