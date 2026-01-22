# Kasita MVP Completion Assessment & Implementation Plan

**Generated: January 2026**

---

## Executive Summary

This document provides a comprehensive assessment of the current implementation status against the MVP user stories defined in `kasita-mvp-user-stories.md`, followed by a staged implementation plan to achieve full MVP completion.

### Overall MVP Completion: ~45%

| Epic | Completion | Status |
|------|------------|--------|
| Epic 1: Learning Objective & Map Generation | 30% | Partial |
| Epic 2: Content Sourcing & Ingestion | 70% | Mostly Complete |
| Epic 3: Content Synthesis & Knowledge Units | 65% | Mostly Complete |
| Epic 4: Adaptive Content Presentation | 25% | Early Stage |
| Epic 5: Feedback Loops | 15% | Early Stage |
| Epic 6: Progress Tracking & Validation | 40% | Partial |
| Epic 7: Input/Output Optionality | 60% | Good Foundation |

---

## Part 1: Detailed Completion Assessment

### Epic 1: Learning Objective & Map Generation

**Target**: Learner states objective → receives structured learning map

| ID | User Story | Status | Notes |
|----|------------|--------|-------|
| LM-01 | Create learning path via natural language objective | Partial | CRUD exists, but no AI generation from natural language |
| LM-02 | AI-generated learning map with principles | Partial | Knowledge graph generation exists, not integrated with learning paths |
| LM-03 | Visual hierarchy showing dependencies | Complete | React Flow visualization implemented |
| LM-04 | Edit/add/remove principles from map | Not Started | No principle entity or editing UI |
| LM-05 | Set target timeline | Partial | Field exists in schema but not exposed in UI |
| LM-06 | Indicate current skill level | Not Started | No skill level assessment flow |
| LM-07 | Save and revisit multiple learning paths | Complete | Full CRUD implemented |

**Key Gaps**:
- No "Principle" entity (learning map uses nodes, not principles)
- No AI generation of learning map from natural language objective
- Knowledge graph generation exists but is standalone, not tied to learning paths

---

### Epic 2: Content Sourcing & Ingestion

**Target**: Configure sources → ingest content from multiple channels

| ID | User Story | Status | Notes |
|----|------------|--------|-------|
| CS-01 | Configure source channels (RSS, URLs, PDFs) | Complete | Full CRUD for SourceConfig |
| CS-02 | AI suggest relevant sources | Not Started | No source recommendation |
| CS-03 | Manual URL/document upload | Partial | Can add URLs, no file upload UI |
| CS-04 | Trigger ingestion with progress | Partial | Patchbay works, no real-time progress in UI |
| CS-05 | View raw content before synthesis | Complete | Raw content list/detail views |
| CS-06 | Exclude specific sources/content | Partial | Can delete, no quality filtering |
| CS-07 | See sources used per principle | Not Started | No principle-source mapping UI |

**Patchbay Adapter Status**:
| Adapter | Status |
|---------|--------|
| RSS/Atom | Complete |
| Article (Trafilatura) | Complete |
| PDF (PyPDF2) | Complete |
| JavaScript Weekly | Complete |
| Newsletter (IMAP) | Placeholder |
| YouTube Transcripts | Not Started |
| Podcast Transcripts | Not Started |

**Key Gaps**:
- No real-time ingestion progress in dashboard
- No YouTube/podcast adapters
- No file upload UI for PDFs

---

### Epic 3: Content Synthesis & Knowledge Units

**Target**: Raw content → structured knowledge units

| ID | User Story | Status | Notes |
|----|------------|--------|-------|
| SY-01 | Trigger synthesis to create knowledge units | Complete | Synthesizer pipeline works |
| SY-02 | Knowledge units extract core concepts | Complete | Claude-powered generation |
| SY-03 | Cross-references between units | Partial | sourceIds tracked, no UI display |
| SY-04 | Review/approve/reject knowledge units | Partial | Status field exists, no approval workflow UI |
| SY-05 | Edit knowledge unit content | Complete | Full edit capability |
| SY-06 | Tagged by difficulty level | Complete | beginner/intermediate/advanced/expert |
| SY-07 | Estimated mastery time | Complete | estimatedTimeSeconds field |

**Knowledge Unit Structure Compliance**:
| Field | Required | Status |
|-------|----------|--------|
| Concept | Yes | Complete |
| Explanation (answer) | Yes | Complete |
| Examples | Yes | Complete |
| Analogies | Yes | Complete |
| Questions (Q&A) | Yes | Complete |
| Challenges | Yes | Not in schema |
| Sources | Yes | Complete (sourceIds) |

**Key Gaps**:
- No approval workflow UI (approve/reject buttons)
- No "challenges" field in knowledge units
- No trigger button in dashboard to run synthesis

---

### Epic 4: Adaptive Content Presentation

**Target**: Content adapts to learner preferences and maintains engagement

| ID | User Story | Status | Notes |
|----|------------|--------|-------|
| AP-01 | Set preferred learning modalities | Not Started | No modality preferences |
| AP-02 | Content adapted to modalities | Not Started | No modality-based rendering |
| AP-03 | Varied presentation formats | Partial | Only flashcards implemented |
| AP-04 | System observes best retention | Not Started | No analytics |
| AP-05 | Manually switch formats | Not Started | Single format only |
| AP-06 | Analogies matched to existing knowledge | Not Started | No personalization |
| AP-07 | Adjust cognitive load | Not Started | No adaptive difficulty |

**Presentation Formats Status**:
| Format | Status |
|--------|--------|
| Flashcards (Infiltrate) | Complete |
| Quizzes | Schema only |
| Challenges | Placeholder |
| Projects | Not Started |

**Key Gaps**:
- Only Infiltrate app is complete
- No modality preferences or adaptive presentation
- No quiz or challenge implementations

---

### Epic 5: Feedback Loops

**Target**: AI and/or mentor feedback accelerates learning

| ID | User Story | Status | Notes |
|----|------------|--------|-------|
| FB-01 | Immediate AI feedback on flashcards | Not Started | No feedback system |
| FB-02 | AI feedback on challenge submissions | Not Started | No challenges |
| FB-03 | AI evaluation of projects | Not Started | No projects |
| FB-04 | Request human mentor review | Not Started | No mentor system |
| FB-05 | Mentor reviews submissions | Not Started | No mentor UI |
| FB-06 | Feedback history | Not Started | No Feedback entity |
| FB-07 | Identify recurring gaps | Not Started | No gap analysis |
| FB-08 | Rate feedback quality | Not Started | No rating system |

**Key Gaps**:
- No Submission entity
- No Feedback entity
- No AI feedback integration
- Entire epic essentially not started

---

### Epic 6: Progress Tracking & Validation

**Target**: Track mastery, validate competence

| ID | User Story | Status | Notes |
|----|------------|--------|-------|
| PT-01 | See mastery level per principle | Partial | UserProgress exists, no principle mapping |
| PT-02 | Overall progress percentage | Partial | Home dashboard shows stats |
| PT-03 | Spaced repetition scheduling | Partial | SM-2 fields exist, algorithm not implemented |
| PT-04 | Complete capstone projects | Not Started | No project system |
| PT-05 | Generate portfolio | Not Started | No portfolio export |
| PT-06 | Time invested vs remaining | Not Started | No time tracking |
| PT-07 | Compare to benchmarks | Not Started | No benchmarks |
| PT-08 | Completion certificate | Not Started | No certificates |

**SM-2 Implementation Status**:
| Component | Status |
|-----------|--------|
| Database fields | Complete |
| Default values | Complete |
| Interval calculation | Not Implemented |
| Easiness factor adjustment | Not Implemented |
| Next review scheduling | Not Implemented |

**Key Gaps**:
- SM-2 algorithm not implemented (critical)
- No capstone projects
- No portfolio or certificate generation

---

### Epic 7: Input/Output Optionality

**Target**: Extensible architecture for sources and learning apps

| ID | User Story | Status | Notes |
|----|------------|--------|-------|
| IO-01 | Add new Patchbay adapters | Complete | Clean adapter pattern |
| IO-02 | Import Anki/Notion | Not Started | No import adapters |
| IO-03 | Browser extension capture | Not Started | No extension |
| IO-04 | Conversation content | Not Started | No chat adapters |
| IO-05 | Add new Learning App types | Complete | Modular app structure |
| IO-06 | Export to Anki/Quizlet | Not Started | No export |
| IO-07 | Printable study materials | Not Started | No print export |
| IO-08 | Share learning paths | Not Started | No sharing |

**Architecture Compliance**:
| Criteria | Status |
|----------|--------|
| Adapter pattern in Patchbay | Complete |
| Standardized API for Learning Apps | Complete |
| Stable knowledge unit schema | Complete |
| API-only communication | Complete |

---

## Part 2: Implementation Plan

### Stage 1: Foundation Completion (Critical Path)

**Goal**: Complete the core learning cycle end-to-end

#### 1.1 SM-2 Spaced Repetition Algorithm
**Priority**: Critical | **Effort**: 2-3 days

**Tasks**:
- Implement `calculateNextReview()` in UserProgressService
- Add `recordAttempt(unitId, quality)` endpoint (quality: 0-5 scale)
- Update easinessFactor based on SM-2 formula:
  ```
  EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  ```
- Calculate next interval: `interval = previousInterval * EF`
- Set nextReviewDate based on calculated interval
- Integrate with Infiltrate app for flashcard responses

**Files to modify**:
- `apps/api/src/user-progress/user-progress.service.ts`
- `apps/api/src/user-progress/user-progress.controller.ts`
- `apps/infiltrate/src/app/flashcards/flashcards.ts`

#### 1.2 Principle Entity & Learning Map Integration
**Priority**: Critical | **Effort**: 3-4 days

**Tasks**:
- Create Principle entity with fields:
  - id, learningPathId, name, description
  - estimatedHours, difficulty (foundational/intermediate/advanced)
  - prerequisites (array of principle IDs)
  - order, status (pending/in_progress/mastered)
- Add Principle CRUD endpoints
- Link principles to LearningPath (OneToMany)
- Link KnowledgeUnits to Principles (ManyToOne)
- Update React Flow visualization to render Principles as nodes
- Add principle editing UI in dashboard

**Files to create**:
- `apps/api/src/principles/` (module, controller, service, entity, DTOs)
- `apps/dashboard/src/app/principles/` (CRUD components)

#### 1.3 AI Learning Map Generation
**Priority**: Critical | **Effort**: 3-4 days

**Tasks**:
- Create `/learning-paths/generate` POST endpoint
- Accept natural language objective in request body
- Call Claude API with structured prompt to generate principle hierarchy
- Parse response and auto-create Principle entities
- Return structured learning map with 8-15 principles
- Include confidence level based on domain coverage

**Files to modify**:
- `apps/api/src/learning-paths/learning-paths.controller.ts`
- `apps/api/src/learning-paths/learning-paths.service.ts`

**New service**:
- `apps/api/src/learning-paths/learning-map-generator.service.ts`

#### 1.4 Dashboard Integration Triggers
**Priority**: High | **Effort**: 2-3 days

**Tasks**:
- Add "Generate Learning Map" button on learning path creation
- Add "Run Ingestion" button to trigger Patchbay from dashboard
- Add "Run Synthesis" button to trigger Synthesizer
- Implement WebSocket progress updates for long-running operations
- Show real-time progress bars during ingestion/synthesis

**Files to modify**:
- `apps/dashboard/src/app/learning-paths/learning-path-detail/`
- `apps/api/src/progress/progress.gateway.ts`

---

### Stage 2: Learning Experience Completion

**Goal**: Complete all MVP presentation formats

#### 2.1 Quiz Runner Implementation
**Priority**: High | **Effort**: 4-5 days

**Tasks**:
- Create new Angular app: `apps/quiz-runner/`
- Implement quiz types:
  - Multiple choice (from knowledge unit Q&A)
  - True/false questions
  - Fill-in-the-blank
- Add scoring with immediate feedback
- Record quiz attempts to UserProgress
- Show explanations after answers
- Support quiz configuration (shuffle, passing score, retries)

**Files to create**:
- `apps/quiz-runner/` (new Angular application)
- Quiz service, components, routing

#### 2.2 Challenge Submission System
**Priority**: High | **Effort**: 4-5 days

**Tasks**:
- Create Submission entity:
  - id, knowledgeUnitId, userId
  - type (coding/whiteboard/oral/essay)
  - content, attachments
  - status (pending/reviewed/passed/failed)
  - submittedAt
- Create Feedback entity:
  - id, submissionId
  - type (ai/mentor), providerId
  - score, rubricScores (JSON)
  - comments, suggestions
  - createdAt
- Build challenge submission UI in dashboard
- Create API endpoints for submissions

**Files to create**:
- `apps/api/src/submissions/` (full module)
- `apps/api/src/feedback/` (full module)
- `apps/dashboard/src/app/challenges/` (update from placeholder)

#### 2.3 Flashcard-Progress Integration
**Priority**: High | **Effort**: 2-3 days

**Tasks**:
- Connect Infiltrate app to Kasita API
- Load flashcards from knowledge units API
- Record each card response as attempt via API
- Update SM-2 metrics on correct/incorrect responses
- Filter cards by nextReviewDate (show due cards first)
- Add mastery level indicators to card UI
- Implement "study session" with configurable card count

**Files to modify**:
- `apps/infiltrate/src/app/flashcards/flashcards.ts`
- `apps/infiltrate/src/app/services/` (new API service)

---

### Stage 3: Feedback & Adaptation

**Goal**: Close the feedback loop

#### 3.1 AI Feedback Generation
**Priority**: High | **Effort**: 3-4 days

**Tasks**:
- Create FeedbackService with Claude integration
- Generate structured feedback for challenge submissions:
  - Overall score (0-100)
  - Rubric breakdown by criteria
  - 2-3 specific improvement suggestions
  - References to submission content
- Store feedback in Feedback entity
- Display feedback in submission detail view
- Support follow-up clarification questions

**Files to create**:
- `apps/api/src/feedback/feedback-generator.service.ts`

**Files to modify**:
- `apps/api/src/feedback/feedback.service.ts`
- `apps/dashboard/src/app/challenges/`

#### 3.2 Progress Analytics
**Priority**: Medium | **Effort**: 3-4 days

**Tasks**:
- Calculate overall learning path completion percentage
- Track time spent per knowledge unit
- Identify struggling areas (low mastery, many attempts)
- Generate insights and recommendations
- Surface analytics on home dashboard
- Add progress charts/visualizations

**Files to modify**:
- `apps/api/src/user-progress/user-progress.service.ts`
- `apps/dashboard/src/app/home/home.ts`

#### 3.3 Content Approval Workflow
**Priority**: Medium | **Effort**: 2-3 days

**Tasks**:
- Add approve/reject buttons to knowledge unit list
- Implement bulk approval capability
- Add status filter (draft/approved/rejected)
- Only include approved units in learning flow
- Show approval status badges in list view

**Files to modify**:
- `apps/dashboard/src/app/knowledge-units/knowledge-units-list/`
- `apps/dashboard/src/app/knowledge-units/knowledge-unit-detail/`

---

### Stage 4: Content Pipeline Enhancement

**Goal**: Robust content ingestion and synthesis

#### 4.1 YouTube Adapter
**Priority**: Medium | **Effort**: 2-3 days

**Tasks**:
- Implement YouTube transcript extraction adapter
- Use youtube-transcript-api or YouTube Data API
- Handle video chapters as separate content items
- Extract metadata (title, channel, duration, views)
- Support playlist ingestion

**Files to create**:
- `apps/patchbay/src/adapters/youtube_adapter.py`

**Files to modify**:
- `apps/patchbay/src/router.py` (register adapter)

#### 4.2 Real-time Ingestion Progress
**Priority**: Medium | **Effort**: 2-3 days

**Tasks**:
- Implement WebSocket events from Patchbay
- Emit progress events: started, processing, completed, failed
- Display live progress bar in dashboard
- Show success/failure status per source
- Enable cancel operation

**Files to modify**:
- `apps/patchbay/src/ingest.py`
- `apps/api/src/progress/progress.gateway.ts`
- `apps/dashboard/src/app/source-configs/`

#### 4.3 Synthesis Trigger from Dashboard
**Priority**: Medium | **Effort**: 2-3 days

**Tasks**:
- Add "Synthesize" button on raw content page
- Create API endpoint to trigger Synthesizer
- Show synthesis progress via WebSocket
- Auto-refresh knowledge units list on completion
- Display synthesis summary (units created, errors)

**Files to modify**:
- `apps/api/src/ingestion/ingestion.controller.ts`
- `apps/dashboard/src/app/raw-content/`

---

### Stage 5: Polish & Validation

**Goal**: Production readiness

#### 5.1 Learning Path Wizard
**Priority**: Medium | **Effort**: 3-4 days

**Tasks**:
- Create multi-step wizard component:
  - Step 1: Enter learning objective (natural language)
  - Step 2: Review/edit AI-generated principles
  - Step 3: Configure sources (AI suggestions + manual)
  - Step 4: Set timeline and current skill level
  - Step 5: Launch ingestion
- Save wizard progress between steps
- Show estimated completion time

**Files to create**:
- `apps/dashboard/src/app/wizard/` (new feature module)

#### 5.2 Portfolio Generation
**Priority**: Low | **Effort**: 2-3 days

**Tasks**:
- Export completed challenges and projects
- Generate PDF/HTML portfolio document
- Include scores, feedback, and evidence
- Add shareable public link option
- Customize portfolio template

**Files to create**:
- `apps/api/src/portfolio/` (new module)
- `apps/dashboard/src/app/portfolio/`

#### 5.3 Performance Optimization
**Priority**: Medium | **Effort**: 2-3 days

**Tasks**:
- Add pagination to large lists
- Implement caching for frequently accessed data
- Lazy load heavy dashboard components
- Optimize database queries with indexes
- Profile and fix performance bottlenecks

**Files to modify**:
- Various API services (add pagination)
- Dashboard components (add virtual scrolling)

---

## Implementation Timeline Overview

```
Stage 1: Foundation (2 weeks)
├── Week 1
│   ├── SM-2 Algorithm (2-3 days)
│   └── Principle Entity (2-3 days)
└── Week 2
    ├── AI Map Generation (3-4 days)
    └── Dashboard Triggers (2-3 days)

Stage 2: Learning Experience (2-3 weeks)
├── Week 3
│   ├── Quiz Runner (4-5 days)
├── Week 4
│   ├── Challenge System (4-5 days)
└── Week 5
    └── Flashcard Integration (2-3 days)

Stage 3: Feedback & Adaptation (2 weeks)
├── Week 6
│   ├── AI Feedback (3-4 days)
│   └── Progress Analytics (3-4 days)
└── Week 7
    └── Approval Workflow (2-3 days)

Stage 4: Content Pipeline (1-2 weeks)
├── Week 8
│   ├── YouTube Adapter (2-3 days)
│   ├── Real-time Progress (2-3 days)
│   └── Synthesis Trigger (2-3 days)

Stage 5: Polish (1-2 weeks)
├── Week 9-10
│   ├── Learning Path Wizard (3-4 days)
│   ├── Portfolio Generation (2-3 days)
│   └── Performance Optimization (2-3 days)
```

**Total Estimated Timeline**: 8-10 weeks

---

## Priority Matrix

### Must Complete for MVP (Critical)
1. SM-2 spaced repetition algorithm
2. Principle entity and learning map integration
3. AI learning map generation from objective
4. Quiz runner implementation
5. Challenge submission with AI feedback
6. Flashcard-API integration

### Should Complete for MVP (High)
7. YouTube transcript adapter
8. Real-time ingestion progress
9. Content approval workflow
10. Progress analytics dashboard
11. Dashboard trigger buttons

### Nice to Have (Medium/Low)
12. Learning path wizard
13. Portfolio generation
14. Browser extension
15. Export to Anki/Quizlet
16. Sharing features

---

## Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| SM-2 algorithm complexity | High | Low | Use well-documented SM-2 reference implementations |
| Claude API costs | Medium | Medium | Batch requests, cache responses, set usage limits |
| Real-time WebSocket complexity | Medium | Medium | Start with polling, upgrade to WebSocket incrementally |
| Large content processing time | Medium | High | Add progress indicators, async job queue |
| Quiz/Challenge scope creep | High | Medium | Define MVP feature set strictly, defer advanced features |

---

## Success Metrics (from MVP doc)

### Quantitative Targets
- [ ] Full learning cycle (objective → competence) in ≤ 20 hours
- [ ] 15 sources → 30 knowledge units in < 30 minutes
- [ ] 80%+ flashcard mastery in ≤ 15 hours practice
- [ ] 10x efficiency vs linear learning (user-reported)

### Qualitative Targets
- [ ] User feels confident discussing topic
- [ ] User can explain concepts without notes
- [ ] User passes performance test (mock interview, etc.)
- [ ] User creates 2nd learning path immediately after first

### Technical Acceptance Criteria
- [ ] Learning map generation < 30 seconds
- [ ] Content ingestion (20 sources) < 10 minutes
- [ ] Synthesis (20 raw items) < 5 minutes
- [ ] Feedback generation < 30 seconds
- [ ] UI response time < 200ms

---

## Current Architecture Strengths

What's working well:
- Clean separation of concerns (API, Patchbay, Synthesizer, Dashboard)
- Adapter pattern in Patchbay enables easy source addition
- NgRx state management with Facades provides consistent patterns
- TypeORM entities align with data models
- React Flow visualization is production-ready
- Infiltrate flashcard app is complete and polished

---

## Appendix: File Reference

### Key API Files
- `apps/api/src/user-progress/` - Progress tracking
- `apps/api/src/knowledge-units/` - Knowledge unit CRUD
- `apps/api/src/learning-paths/` - Learning path CRUD
- `apps/api/src/knowledge-graph/` - Graph generation (Claude)

### Key Dashboard Files
- `apps/dashboard/src/app/home/` - Home dashboard
- `apps/dashboard/src/app/learning-paths/` - Learning path management
- `apps/dashboard/src/app/pages/learning-map/` - React Flow visualization

### Key Patchbay Files
- `apps/patchbay/src/adapters/` - Content adapters
- `apps/patchbay/src/ingest.py` - Ingestion orchestrator
- `apps/patchbay/src/api_client.py` - API integration

### Key Synthesizer Files
- `apps/synthesizer/generators/knowledge_unit_generator.py` - Claude integration
- `apps/synthesizer/processors/embeddings.py` - Embedding generation
- `apps/synthesizer/processors/clustering.py` - Content clustering
- `apps/synthesizer/src/orchestrator.py` - Pipeline orchestration

---

*This plan should be reviewed weekly and adjusted based on progress and emerging priorities.*
