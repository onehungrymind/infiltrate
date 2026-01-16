# Kasita MVP Completion Assessment

**Last Updated**: January 15, 2026
**Overall Completion**: 85%

---

## Quick Status

| Epic | Progress | Status |
|------|----------|--------|
| Epic 1: Learning Objective & Map Generation | 70% | :large_blue_circle: Mostly Complete |
| Epic 2: Content Sourcing & Ingestion | 90% | :white_check_mark: Nearly Complete |
| Epic 3: Content Synthesis & Knowledge Units | 80% | :large_blue_circle: Mostly Complete |
| Epic 4: Adaptive Content Presentation | 75% | :large_blue_circle: Mostly Complete |
| Epic 5: Feedback Loops | 85% | :large_blue_circle: Mostly Complete |
| Epic 6: Progress Tracking & Validation | 60% | :yellow_circle: Partial |
| Epic 7: Input/Output Optionality | 75% | :large_blue_circle: Mostly Complete |

---

## Epic 1: Learning Objective & Map Generation (70%)

### Completed
- [x] LM-03: Visual hierarchy showing dependencies (React Flow)
- [x] LM-07: Save and revisit multiple learning paths (CRUD)
- [x] Principle entity with full CRUD (API + Dashboard)
- [x] LM-02: AI-generated learning map with principles
  - Claude-powered principle generation from learning path objectives
  - Dashboard UI with "Generate Principles with AI" button
  - Generated principles saved to database with prerequisites

### Partial
- [ ] LM-01: Create learning path via natural language objective
  - CRUD exists, AI generates principles but not path itself
- [ ] LM-04: Edit/add/remove principles from map
  - Principle CRUD exists, generation preview exists, not fully integrated with React Flow

### Not Started
- [ ] LM-05: Set target timeline (field exists, no UI)
- [ ] LM-06: Indicate current skill level

### Blockers
- ~~No "Principle" entity exists~~ (Resolved)
- ~~AI generation not available~~ (Resolved)

---

## Epic 2: Content Sourcing & Ingestion (90%)

### Completed
- [x] CS-01: Configure source channels (RSS, URLs, PDFs)
- [x] CS-02: AI suggest relevant sources (Claude-powered source suggestions in Learning Path detail)
- [x] CS-05: View raw content before synthesis
- [x] RSS/Atom adapter
- [x] Article adapter (Trafilatura)
- [x] PDF adapter (PyPDF2)
- [x] JavaScript Weekly adapter
- [x] CS-04: Trigger ingestion with progress (Dashboard button with result feedback)
- [x] Many-to-many Source/LearningPath relationship (sources can be shared across paths)
- [x] Source path links with per-path enabled status

### Partial
- [ ] CS-03: Manual URL/document upload (URLs work, file upload now available via Submissions)
- [ ] CS-06: Exclude specific sources/content (delete works, no filtering)

### Not Started
- [ ] CS-07: See sources used per principle
- [ ] YouTube transcript adapter
- [ ] Podcast transcript adapter
- [ ] Newsletter (IMAP) adapter

---

## Epic 3: Content Synthesis & Knowledge Units (80%)

### Completed
- [x] SY-01: Trigger synthesis to create knowledge units
- [x] SY-02: Knowledge units extract core concepts (Claude-powered)
- [x] SY-05: Edit knowledge unit content
- [x] SY-06: Tagged by difficulty level
- [x] SY-07: Estimated mastery time
- [x] Synthesis trigger button in dashboard (with result feedback)

### Partial
- [ ] SY-03: Cross-references between units (sourceIds tracked, no UI)
- [ ] SY-04: Review/approve/reject units (status field exists, no workflow UI)

### Not Started
- [ ] ~~Add "challenges" field to knowledge units~~ (Resolved - Challenge entity links to KnowledgeUnit)

---

## Epic 4: Adaptive Content Presentation (75%)

### Completed
- [x] Flashcards (Infiltrate app) - gamified experience
- [x] Study Flashcards (Dashboard) - simple study mode with SM-2 integration
- [x] Study Quiz (Dashboard) - multiple choice and true/false with SM-2 integration
- [x] AP-03: Varied presentation formats (flashcards and quiz in Dashboard)
- [x] Challenge entity with CRUD (API + Dashboard)
  - Challenges linked to KnowledgeUnits
  - Custom rubric criteria per challenge
  - Difficulty levels and time estimates
  - Dashboard UI with list and detail views
- [x] Project entity with CRUD (API + Dashboard)
  - Projects linked to LearningPaths
  - Objectives and requirements
  - Dashboard UI with list and detail views

### Not Started
- [ ] AP-01: Set preferred learning modalities
- [ ] AP-02: Content adapted to modalities
- [ ] AP-04: System observes best retention
- [ ] AP-05: Manually switch formats
- [ ] AP-06: Analogies matched to existing knowledge
- [ ] AP-07: Adjust cognitive load
- [ ] Challenge Arena app (learning app interface)

---

## Epic 5: Feedback Loops (80%)

### Completed
- [x] FB-02: AI feedback on challenge submissions (Claude-powered)
- [x] Submission entity with full CRUD
  - Extended content types: text, URL (with metadata extraction), file upload
  - Link to Challenge or Project
  - URL metadata fetcher (GitHub integration with repo stats)
  - File upload with drag-drop (10MB limit, multiple formats)
- [x] Feedback entity with full CRUD
- [x] AI feedback generation with rubric-based evaluation
- [x] FB-04: Request human mentor review
  - Mentor assignment to learning paths
  - Submissions visible to assigned mentor
- [x] FB-05: Mentor reviews submissions
  - Mentor Dashboard with submission list and review form
  - Rubric-based scoring with per-criterion feedback
  - Suggestions and detailed comments
  - Project grading (Accepted / Accepted with Comments / Needs Work)
  - Grade badge display on submissions

### Partial
- [ ] FB-06: Feedback history (exists per submission, no aggregated view)

### Not Started
- [ ] FB-01: Immediate AI feedback on flashcards
- [ ] FB-03: AI evaluation of projects (larger scope projects)
- [ ] FB-07: Identify recurring gaps
- [ ] FB-08: Rate feedback quality

### Blockers
- ~~Entire epic depends on Challenge system~~ (Resolved)
- ~~Submission entity not implemented~~ (Resolved)
- ~~Feedback entity not implemented~~ (Resolved)
- ~~Mentor feedback system not implemented~~ (Resolved)

---

## Epic 6: Progress Tracking & Validation (60%)

### Completed
- [x] UserProgress entity with SM-2 fields
- [x] Basic progress stats on home dashboard
- [x] PT-03: SM-2 spaced repetition algorithm (recordAttempt, getDueForReview, getStudyStats endpoints)

### Partial
- [ ] PT-01: See mastery level per principle (exists, no principle mapping)
- [ ] PT-02: Overall progress percentage (basic stats only)

### Not Started
- [ ] PT-04: Complete capstone projects
- [ ] PT-05: Generate portfolio
- [ ] PT-06: Time invested vs remaining
- [ ] PT-07: Compare to benchmarks
- [ ] PT-08: Completion certificate

### Blockers
- (None - SM-2 blocker resolved)

---

## Epic 7: Input/Output Optionality (75%)

### Completed
- [x] IO-01: Add new Patchbay adapters (clean adapter pattern)
- [x] IO-05: Add new Learning App types (modular structure)
- [x] Adapter pattern architecture
- [x] Standardized API for Learning Apps
- [x] Stable knowledge unit schema
- [x] API-only communication
- [x] File upload for submissions (PDF, images, code files, ZIP)
- [x] URL submission with metadata extraction

### Not Started
- [ ] IO-02: Import Anki/Notion
- [ ] IO-03: Browser extension capture
- [ ] IO-04: Conversation content ingestion
- [ ] IO-06: Export to Anki/Quizlet
- [ ] IO-07: Printable study materials
- [ ] IO-08: Share learning paths

---

## Critical Path Items

These must be completed for a functional MVP:

| Item | Status | Blocking |
|------|--------|----------|
| SM-2 spaced repetition algorithm | :white_check_mark: Complete | ~~Progress tracking~~ |
| Principle entity & CRUD | :white_check_mark: Complete | ~~Learning map structure~~ |
| AI principle generation | :white_check_mark: Complete | ~~Core user flow~~ |
| Quiz with SM-2 integration | :white_check_mark: Complete | ~~Learning variety~~ |
| Challenge & Project entities | :white_check_mark: Complete | ~~Feedback loop~~ |
| Submission system (text/URL/file) | :white_check_mark: Complete | ~~Feedback loop~~ |
| AI feedback generation | :white_check_mark: Complete | ~~Feedback loop~~ |
| Mentor feedback system | :white_check_mark: Complete | ~~Human review flow~~ |
| React Flow learning map | :white_check_mark: Complete | ~~Visualization~~ |
| Content ingestion pipeline | :white_check_mark: Complete | ~~Content acquisition~~ |
| Knowledge unit synthesis | :white_check_mark: Complete | ~~Content processing~~ |

---

## Component Status

### API (NestJS)
| Component | Status |
|-----------|--------|
| **Core CRUD** | |
| User CRUD + JWT Auth | :white_check_mark: Complete |
| Learning Path CRUD | :white_check_mark: Complete |
| Knowledge Unit CRUD | :white_check_mark: Complete |
| Principle CRUD | :white_check_mark: Complete |
| Challenge CRUD | :white_check_mark: Complete |
| Project CRUD | :white_check_mark: Complete |
| Submission CRUD | :white_check_mark: Complete |
| Feedback CRUD | :white_check_mark: Complete |
| User Progress CRUD | :white_check_mark: Complete |
| Raw Content CRUD | :white_check_mark: Complete |
| **Source Management** | |
| Sources (many-to-many) | :white_check_mark: Complete |
| Source Path Links | :white_check_mark: Complete |
| **Learning Map** | |
| Learning map endpoints | :white_check_mark: Complete |
| Node status tracking | :yellow_circle: Partial (TODOs) |
| **AI Features** | |
| AI principle generation | :white_check_mark: Complete |
| AI source suggestions | :white_check_mark: Complete |
| AI feedback generation | :white_check_mark: Complete |
| **Ingestion & Synthesis** | |
| Ingestion trigger endpoint | :white_check_mark: Complete |
| Synthesis trigger endpoint | :white_check_mark: Complete |
| Knowledge graph generation | :white_check_mark: Complete |
| **Submissions** | |
| File upload (Multer) | :white_check_mark: Complete |
| URL metadata extraction | :white_check_mark: Complete |
| Submit for review flow | :white_check_mark: Complete |
| **Mentor System** | |
| Mentor assignment | :white_check_mark: Complete |
| Mentor submissions query | :white_check_mark: Complete |
| Mentor feedback submission | :white_check_mark: Complete |
| **SM-2 Algorithm** | |
| Record attempt | :white_check_mark: Complete |
| Due for review | :white_check_mark: Complete |
| Study stats | :white_check_mark: Complete |

### Dashboard (Angular)
| Component | Status |
|-----------|--------|
| **Auth & Navigation** | |
| Login/auth flow | :white_check_mark: Complete |
| Sidebar navigation | :white_check_mark: Complete |
| Home dashboard | :white_check_mark: Complete |
| **Core CRUD Pages** | |
| Users management | :white_check_mark: Complete |
| Learning Paths CRUD | :white_check_mark: Complete |
| Knowledge Units CRUD | :white_check_mark: Complete |
| Principles CRUD | :white_check_mark: Complete |
| Challenges CRUD | :white_check_mark: Complete |
| Projects CRUD | :white_check_mark: Complete |
| Submissions CRUD | :white_check_mark: Complete |
| Raw Content CRUD | :white_check_mark: Complete |
| Sources CRUD | :white_check_mark: Complete |
| User Progress CRUD | :white_check_mark: Complete |
| **Filters** | |
| Learning Path filter (Principles) | :white_check_mark: Complete |
| Learning Path filter (Knowledge Units) | :white_check_mark: Complete |
| Search/filter bar component | :white_check_mark: Complete |
| **Learning Map & Visualization** | |
| React Flow learning map | :white_check_mark: Complete |
| Knowledge graph visualization | :white_check_mark: Complete |
| Cytoscape graph view | :white_check_mark: Complete |
| **Study Features** | |
| Study Flashcards (SM-2) | :white_check_mark: Complete |
| Study Quiz (SM-2) | :white_check_mark: Complete |
| **AI Features** | |
| AI principle generation UI | :white_check_mark: Complete |
| AI source suggestions UI | :white_check_mark: Complete |
| AI feedback request UI | :white_check_mark: Complete |
| **Pipeline Triggers** | |
| Ingestion trigger button | :white_check_mark: Complete |
| Synthesis trigger button | :white_check_mark: Complete |
| **Submission Features** | |
| Content type selector | :white_check_mark: Complete |
| File upload dropzone | :white_check_mark: Complete |
| URL metadata fetcher | :white_check_mark: Complete |
| Challenge/Project selector | :white_check_mark: Complete |
| Feedback display | :white_check_mark: Complete |
| Grade badge display | :white_check_mark: Complete |
| **Mentor System** | |
| Mentor Dashboard | :white_check_mark: Complete |
| Mentor assignment selector | :white_check_mark: Complete |
| Mentor review form | :white_check_mark: Complete |
| **Other** | |
| Completion Assessment | :white_check_mark: Complete |
| Marimo notebook viewer | :white_check_mark: Complete |
| **Not Started** | |
| Learning path wizard (multi-step) | :red_circle: Not Started |
| KU approval workflow UI | :red_circle: Not Started |
| Home nav actions (partial TODOs) | :yellow_circle: Placeholder |

### Patchbay (Python)
| Component | Status |
|-----------|--------|
| RSS adapter | :white_check_mark: Complete |
| Article adapter | :white_check_mark: Complete |
| PDF adapter | :white_check_mark: Complete |
| JavaScript Weekly adapter | :white_check_mark: Complete |
| API integration | :white_check_mark: Complete |
| YouTube adapter | :red_circle: Not Started |
| Podcast adapter | :red_circle: Not Started |
| Newsletter (IMAP) adapter | :yellow_circle: Placeholder |

### Synthesizer (Python)
| Component | Status |
|-----------|--------|
| Embeddings processor | :white_check_mark: Complete |
| Clustering processor | :white_check_mark: Complete |
| Knowledge unit generator | :white_check_mark: Complete |
| API integration | :white_check_mark: Complete |
| Pipeline orchestrator | :white_check_mark: Complete |
| Claude AI integration | :white_check_mark: Complete |

### Learning Apps
| App | Status |
|-----|--------|
| Infiltrate (Gamified Flashcards) | :white_check_mark: Complete |
| Study Flashcards (SM-2) | :white_check_mark: Complete |
| Study Quiz (SM-2) | :white_check_mark: Complete |
| Challenge Arena | :red_circle: Not Started |

---

## Recent Changes

### January 15, 2026 (Update 12)
- **Completion Assessment Update** - Thorough review and component update:
  - Updated overall completion to 85%
  - Expanded critical path items from 6 to 11 (all complete)
  - Expanded API components from 22 to 30 with categorization
  - Expanded Dashboard components from 25 to 42 with categorization
  - Updated all epic percentages based on actual implementation status
  - Added Synthesizer Claude AI integration to component list

### January 15, 2026 (Update 11)
- **Mentor Feedback System** - Complete implementation:
  - Added mentorId field to LearningPath entity
  - Added grade field to Submission entity (accepted/accepted_with_comments/needs_work)
  - Created mentor assignment API endpoints (PATCH /learning-paths/:id/mentor)
  - Created mentor submissions endpoint (GET /submissions/mentor/:mentorId)
  - Created mentor feedback endpoint (POST /submissions/:id/feedback/mentor)
  - Created Mentor Dashboard UI with master-detail layout
    - Submission list with search and filter bar
    - Review form with rubric scoring
    - Suggestions and detailed comments input
    - Project grade selector
  - Added mentor assignment selector to Learning Path detail
  - Added grade badge display to submission feedback component
  - Updated seeder with mentor user and sample submissions/feedback
  - NgRx state management for mentor submissions and feedback
- Overall completion increased from 78% to 85%
- Epic 5 (Feedback Loops) increased from 60% to 85%

### January 15, 2026 (Update 10)
- **Challenges & Projects System** - Major feature implementation:
  - Created Challenge entity (API) with full CRUD
    - Links to KnowledgeUnit
    - Custom rubric criteria (name, description, maxPoints)
    - Difficulty levels, time estimates, success criteria
    - Content type constraints
  - Created Project entity (API) with full CRUD
    - Links to LearningPath
    - Objectives and requirements arrays
    - Difficulty levels and time estimates
  - Created NgRx state management for Challenges and Projects
  - Created Dashboard UI for Challenges (list + detail with rubric builder)
  - Created Dashboard UI for Projects (list + detail)
  - Added routes and sidebar navigation
- **Extended Submission Types** - Full implementation:
  - Updated Submission entity with challengeId, projectId, urlMetadata, fileMetadata
  - Created file upload utility (Multer config, 10MB limit, multiple formats)
  - Created URL metadata fetcher (GitHub API integration, page scraping)
  - Updated submission-detail component with:
    - Content type selector (text/code, URL, file)
    - URL input with "Fetch Metadata" button showing repo stats
    - File upload dropzone with drag-and-drop
    - Challenge/Project selector dropdowns
  - Updated submissions-list with content type icons
  - Added file upload and URL metadata methods to submissions service
- **Database Seeding** - Added seed data:
  - 4 Challenges (RSC dashboard, streaming SSR, gradient descent, utility types)
  - 3 Projects (RSC e-commerce, ML pipeline, TS API generator)
- Overall completion increased from 70% to 78%
- Epic 4 (Adaptive Content) increased from 50% to 70%
- Epic 5 (Feedback Loops) increased from 15% to 60%
- Epic 7 (Input/Output) increased from 60% to 70%

### January 15, 2026 (Update 9)
- **Source Config Many-to-Many Refactoring** - Major architectural improvement:
  - Refactored from one-to-many to many-to-many relationship between Sources and LearningPaths
  - Created Source entity (replaces SourceConfig) with unique URL constraint
  - Created SourcePathLink junction table with per-path enabled status
  - Updated API with new endpoints: `/sources`, `/sources/path/:pathId`, `/sources/:id/link/:pathId`
  - Sources can now be shared across multiple learning paths
- **Dashboard Filtering Improvements**:
  - Added Learning Path dropdown filter to Principles page
  - Added Learning Path dropdown filter to Knowledge Units page
  - Dynamic filter configs based on loaded learning paths
- **Python Ingestion Fixes**:
  - Fixed Python command to use `uv run python` for virtual environment
  - Updated pyproject.toml files to use `dependency-groups.dev` (removed deprecated `tool.uv.dev-dependencies`)
  - API now passes sources directly via SOURCES_JSON env var (bypasses auth requirement)
  - Increased API body size limit to 10MB for large content ingestion
- **Code Cleanup**:
  - Added Python patterns to .gitignore (`__pycache__/`, `*.pyc`, etc.)
  - Removed 34 tracked pycache files from git
- Overall completion increased from 65% to 70%
- Epic 2 (Content Sourcing) increased from 80% to 90%

### January 14, 2026 (Update 8)
- Added Ingestion and Synthesis trigger buttons to Learning Path detail:
  - Added `POST /learning-map/ingest/:pathId` endpoint to trigger Patchbay ingestion
  - Added `POST /learning-map/synthesize/:pathId` endpoint to trigger Synthesizer
  - Added trigger buttons to Learning Path detail component with loading states
  - Shows success/error messages and result statistics (sources processed, items ingested, knowledge units generated)
  - Validates prerequisites before triggering (source configs exist, raw content exists)
- Stage 1 (Foundation) is now complete!
- Overall completion increased from 62% to 65%
- Epic 2 (Content Sourcing) increased from 70% to 80%
- Epic 3 (Content Synthesis) increased from 65% to 75%

### January 14, 2026 (Update 7)
- Enhanced AI learning map generation:
  - Added `force` parameter to regenerate principles (auto-deletes existing)
  - Fixed foreign key constraint by unlinking knowledge units before deletion
  - Added `onDelete: 'SET NULL'` to KnowledgeUnit-Principle relationship
  - State resets when switching learning paths in MDV
- Fixed SVG icons throughout dashboard:
  - Replaced mat-icon with inline SVGs (project uses SVG icons, not Material Icons font)
  - Added wizard sparkles icon from Nodal project for AI generation button
  - Fixed error icon in learning paths list
- Overall completion remains at 62%

### January 14, 2026 (Update 6)
- Implemented AI learning map generation feature:
  - Added Claude-powered principle generation to LearningMapService
  - Created prompt template for structured learning map generation
  - Added POST `/learning-map/generate/:pathId` endpoint
  - Added "Generate Principles with AI" button to learning path detail
  - Shows loading state, success/error feedback, and generated principles preview
  - Generated principles include name, description, difficulty, estimated hours, prerequisites
- Overall completion increased from 58% to 62%
- Epic 1 progress increased from 45% to 60%

### January 14, 2026 (Update 5)
- Verified Principle entity implementation is complete
- Added Completion Assessment dashboard page with:
  - KPI cards showing epic count, critical path progress, API/Dashboard completion rates
  - Epic progress visualization with progress bars
  - Critical path items tracker
  - Component status breakdown for API, Dashboard, Patchbay, Synthesizer, Learning Apps
- Added Completion Assessment to sidebar Admin section
- Overall completion increased from 55% to 58%

### January 14, 2026 (Update 4)
- Implemented Quiz feature in Dashboard with full functionality
- Created `/study/quiz` route with multiple choice and true/false questions
- Quiz generates questions from knowledge unit Q&A fields
- Distractors pulled from other knowledge units for multiple choice
- Added setup screen with learning path filter, question count, and due-only toggle
- Score tracking with results screen and answer review
- SM-2 integration: records attempts on each answer
- Color-coded results based on score (excellent/good/fair/needs-work)
- Overall completion increased from 52% to 55%

### January 13, 2026 (Update 3)
- Implemented Study feature in Dashboard with Flashcards and Quiz (placeholder) modes
- Created `/study/flashcards` route with full SM-2 integration
- Added 3D flip card animation, rating buttons (Again/Hard/Good/Easy), keyboard navigation
- Added learning path filter and "Due for Review" toggle
- Enhanced UserProgress state layer with recordAttempt, dueForReview, studyStats actions/effects
- Added Study icon and navigation in sidebar
- Overall completion increased from 48% to 52%

### January 13, 2026 (Update 2)
- Implemented SM-2 spaced repetition algorithm
- Added `POST /user-progress/record-attempt` endpoint
- Added `GET /user-progress/due-for-review` endpoint
- Added `GET /user-progress/stats` endpoint
- Added `GET /user-progress/user/:userId` endpoint
- Created `RecordAttemptDto` for attempt recording
- Overall completion increased from 45% to 48%

### January 13, 2026
- Initial assessment created
- Documented all epic completion status
- Identified critical path items
- Mapped component-level status

---

## Next Milestone Target

**Target**: Complete Stage 1 (Foundation) from implementation plan :white_check_mark:

- [x] SM-2 Algorithm implementation
- [x] Study Flashcards with SM-2 integration
- [x] Quiz implementation with SM-2 integration
- [x] Principle entity and CRUD
- [x] AI learning map generation
- [x] Dashboard trigger buttons (Ingestion, Synthesis)

**Target**: Stage 2 - Challenges & Projects :white_check_mark:
- [x] Challenge entity with CRUD
- [x] Project entity with CRUD
- [x] Extended submission types (text, URL, file)
- [x] File upload with drag-drop
- [x] URL metadata extraction
- [x] Challenge/Project selector in submissions

**Target**: Stage 3 - Human Review Flow :white_check_mark:
- [x] Human mentor review flow (Mentor Dashboard)
- [x] Mentor assignment to learning paths
- [x] Project grading system

**Next Target**: Stage 4 - Polish & Enhancement
- [ ] Approval workflow UI for knowledge units
- [ ] Challenge Arena learning app
- [ ] Portfolio generation
- [ ] Feedback history aggregation

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.1 | 2026-01-15 | Completion Assessment Update - thorough review, expanded component lists, updated percentages |
| 2.0 | 2026-01-15 | Mentor Feedback System - mentor dashboard, assignment, grading, seeder updates |
| 1.9 | 2026-01-15 | Challenges & Projects system, Extended submission types, File upload, URL metadata |
| 1.8 | 2026-01-15 | Source many-to-many refactoring, Learning Path filters, Python ingestion fixes |
| 1.7 | 2026-01-14 | Ingestion and Synthesis trigger buttons, Stage 1 complete |
| 1.6 | 2026-01-14 | Force regeneration, FK constraint fix, SVG icon fixes |
| 1.5 | 2026-01-14 | AI learning map generation with Claude, dashboard trigger button |
| 1.4 | 2026-01-14 | Principle entity complete, Completion Assessment dashboard added |
| 1.3 | 2026-01-14 | Quiz feature with multiple choice, true/false, and SM-2 integration |
| 1.2 | 2026-01-13 | Study feature with flashcards and SM-2 integration |
| 1.1 | 2026-01-13 | SM-2 algorithm implemented |
| 1.0 | 2026-01-13 | Initial assessment |
