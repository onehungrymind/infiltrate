# Kasita Demo Implementation Checklist

Quick reference checklist for getting Kasita to a working demo state.

## Milestone 1: Working Demo with Mock Data ⏱️ 15-21 hours

### Phase 1.1: NgRx Store Configuration (2-3h)
- [ ] Install `@ngrx/store`, `@ngrx/effects`, `@ngrx/store-devtools` (if not already)
- [ ] Add `provideStore()` to dashboard `app.config.ts`
- [ ] Add `provideState()` for each feature:
  - [ ] `learningPathsFeature`
  - [ ] `knowledgeUnitsFeature`
  - [ ] `rawContentFeature`
  - [ ] `sourceConfigsFeature`
  - [ ] `userProgressFeature`
- [ ] Add `provideEffects()` with all effects
- [ ] Add `StoreDevtoolsModule` for development
- [ ] Repeat for infiltrate app
- [ ] Test store connection in a component

### Phase 1.2: Routing Setup (1-2h)
- [ ] Create routes in dashboard `app.routes.ts`:
  - [ ] `/` → home or redirect to learning-paths
  - [ ] `/learning-paths` → LearningPaths component
  - [ ] `/knowledge-units` → KnowledgeUnits component
  - [ ] `/raw-content` → RawContent component
  - [ ] `/source-configs` → SourceConfigs component
  - [ ] `/user-progress` → UserProgress component
- [ ] Create routes in infiltrate `app.routes.ts`
- [ ] Add `<router-outlet>` to both app templates
- [ ] Test navigation between routes

### Phase 1.3: Connect Components to NgRx (4-5h)
- [ ] Verify all master-detail components inject facades
- [ ] Ensure `loadAll()` is called in `ngOnInit`
- [ ] Test that observables receive data
- [ ] Create temporary mock data service
- [ ] Test full NgRx flow with mock data
- [ ] Verify all 5 entities work correctly

### Phase 1.4: Basic Authentication Mock (3-4h)
- [ ] Create `auth.service.ts` with mock login
- [ ] Create `auth.guard.ts` to protect routes
- [ ] Create login component in dashboard
- [ ] Add login route (`/login`)
- [ ] Store mock user in service/localStorage
- [ ] Update all API calls to use `userId`

### Phase 1.5: Database Seeding and API (2-3h)
- [ ] Start API server: `nx serve api`
- [ ] Seed database: `POST http://localhost:3333/api/seed`
- [ ] Verify data in database file
- [ ] Test API endpoints in Swagger: `http://localhost:3333/api/docs`
- [ ] Replace mock service with real HTTP services
- [ ] Test data loads from API in dashboard

### Phase 1.6: UI Polish (3-4h)
- [ ] Create/update header component with navigation
- [ ] Add loading states to all components
- [ ] Add error handling
- [ ] Add basic styling/layout
- [ ] Test all CRUD operations via UI

**Milestone 1 Success Criteria:**
- ✅ Dashboard loads and displays all entities
- ✅ Data comes from API
- ✅ Can navigate between views
- ✅ Can view/edit details
- ✅ Mock auth works

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

### Phase 2.4: Real Authentication (6-8h)
- [ ] Install `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`
- [ ] Create auth module with login endpoint
- [ ] Create JWT strategy and guard
- [ ] Update Angular auth service to use JWT
- [ ] Create HTTP interceptor for JWT tokens
- [ ] Protect API endpoints with `@UseGuards(JwtAuthGuard)`
- [ ] Test authentication flow
- [ ] Create users table/entity (if needed)

### Phase 2.5: Polish and Error Handling (4-5h)
- [ ] Add global error handler in Angular
- [ ] Format API error responses
- [ ] Add user-friendly error messages
- [ ] Add processing status indicators
- [ ] Integrate WebSocket for real-time updates (optional)
- [ ] Update documentation

**Milestone 2 Success Criteria:**
- ✅ Patchbay ingests content → database
- ✅ Synthesizer processes → knowledge units → database
- ✅ Data visible in dashboard
- ✅ Full pipeline works end-to-end
- ✅ Real JWT authentication protects API

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

