# Classroom Admin Page - Implementation Plan

## Overview

Create an admin interface for managing classroom content generation, editing, and approval. This page will allow administrators to:

1. View classroom content generation status across all learning paths
2. Trigger content generation for paths or individual sub-concepts
3. Monitor generation progress in real-time
4. Edit and approve generated content
5. Manage failed generations and retry

---

## Phase 1: Backend API Enhancements

### 1.1 Create Admin Controller

**File:** `apps/api/src/classroom/classroom-admin.controller.ts`

```typescript
@Controller('admin/classroom')
@UseGuards(JwtAuthGuard, AdminGuard)  // Add admin role check
export class ClassroomAdminController {

  // === STATUS & REPORTING ===

  @Get('overview')
  // Returns aggregate stats across all paths:
  // - Total learning paths with classroom content
  // - Content by status (pending/generating/ready/error)
  // - Recent generation activity

  @Get('paths/:learningPathId/status')
  // Detailed status for a specific path:
  // - Per-concept breakdown
  // - Per-sub-concept content status
  // - Quiz generation status
  // - Error details if any

  @Get('content')
  // Paginated list of all classroom content with filtering:
  // - Filter by status, path, concept
  // - Sort by date, status
  // - Include error messages for failed items

  @Get('content/:contentId')
  // Full content details including sections for editing

  @Get('errors')
  // All content with 'error' status for quick access

  // === GENERATION MANAGEMENT ===

  @Post('paths/:learningPathId/generate')
  // Queue generation for entire learning path
  // Returns job ID for tracking

  @Post('content/:contentId/regenerate')
  // Regenerate single content item

  @Post('concepts/:conceptId/generate')
  // Generate all content for a concept

  @Post('sub-concepts/:subConceptId/generate')
  // Generate content for single sub-concept

  @Delete('paths/:learningPathId/content')
  // Clear all content for a path (for fresh regeneration)

  // === CONTENT EDITING ===

  @Patch('content/:contentId')
  // Update content (title, summary, sections)
  // Accepts: { title?, summary?, sections?, status? }

  @Post('content/:contentId/approve')
  // Mark content as approved/reviewed
  // Sets status to 'ready' and adds approvedAt timestamp

  // === JOB MANAGEMENT ===

  @Get('jobs')
  // List all classroom generation jobs (paginated)
  // Filter by status, path

  @Get('jobs/:jobId')
  // Get job details with full progress info

  @Delete('jobs/:jobId')
  // Cancel a running job
}
```

### 1.2 Enhance ClassroomService

**File:** `apps/api/src/classroom/classroom.service.ts`

Add methods:

```typescript
// Get overview stats
async getOverviewStats(): Promise<{
  totalPaths: number;
  contentByStatus: Record<string, number>;
  quizzesByStatus: Record<string, number>;
  recentActivity: Array<{ action: string; timestamp: Date; details: string }>;
}>

// Get detailed path status with nested structure
async getDetailedPathStatus(learningPathId: string): Promise<{
  learningPath: { id: string; name: string };
  concepts: Array<{
    concept: Concept;
    subConcepts: Array<{
      subConcept: SubConcept;
      content: ClassroomContent | null;
      quiz: MicroQuiz | null;
    }>;
    stats: { total: number; ready: number; generating: number; error: number };
  }>;
  overallStats: { total: number; ready: number; generating: number; error: number };
}>

// Get paginated content list
async getContentList(options: {
  page: number;
  limit: number;
  status?: string;
  learningPathId?: string;
  conceptId?: string;
}): Promise<{ items: ClassroomContent[]; total: number; pages: number }>

// Update content
async updateContent(contentId: string, updates: {
  title?: string;
  summary?: string;
  sections?: ClassroomSection[];
}): Promise<ClassroomContent>

// Approve content
async approveContent(contentId: string): Promise<ClassroomContent>

// Clear path content
async clearPathContent(learningPathId: string): Promise<{ deleted: number }>
```

### 1.3 Add DTOs

**File:** `apps/api/src/classroom/dto/admin.dto.ts`

```typescript
export class ContentListQueryDto {
  @IsOptional() @IsNumber() page?: number = 1;
  @IsOptional() @IsNumber() limit?: number = 20;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsUUID() learningPathId?: string;
  @IsOptional() @IsUUID() conceptId?: string;
}

export class UpdateContentDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() summary?: string;
  @IsOptional() @IsArray() sections?: any[];
}

export class GeneratePathDto {
  @IsOptional() @IsBoolean() force?: boolean; // Regenerate even if content exists
}
```

### 1.4 Add WebSocket Events for Admin

**File:** `apps/api/src/classroom/classroom.gateway.ts` (new)

```typescript
@WebSocketGateway({ namespace: '/classroom' })
export class ClassroomGateway {
  @WebSocketServer() server: Server;

  constructor(private eventEmitter: EventEmitter2) {
    // Listen for classroom generation events and broadcast
    this.eventEmitter.on('classroom.progress', (event) => {
      this.server.to(`path-${event.learningPathId}`).emit('progress', event);
    });
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(client: Socket, learningPathId: string) {
    client.join(`path-${learningPathId}`);
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(client: Socket, learningPathId: string) {
    client.leave(`path-${learningPathId}`);
  }
}
```

### 1.5 Update Worker to Emit Events

**File:** `apps/api/src/classroom/workers/classroom-generation.worker.ts`

Ensure all progress events are emitted:

```typescript
// Emit at each stage:
this.eventEmitter.emit('classroom.progress', {
  learningPathId,
  type: 'started' | 'concept-started' | 'subconcept-generating' |
        'subconcept-ready' | 'subconcept-failed' | 'path-ready' | 'failed',
  conceptId,
  subConceptId,
  message: string,
  progress: { completed: number, total: number, percentage: number },
  error?: string,
  timestamp: new Date(),
});
```

---

## Phase 2: NgRx State Management

### 2.1 Create Classroom Admin Feature

**Directory:** `libs/core-state/src/lib/classroom-admin/`

#### Actions (`classroom-admin.actions.ts`)

```typescript
// Overview
export const loadOverview = createAction('[Classroom Admin] Load Overview');
export const loadOverviewSuccess = createAction('[Classroom Admin] Load Overview Success', props<{ stats: OverviewStats }>());
export const loadOverviewFailure = createAction('[Classroom Admin] Load Overview Failure', props<{ error: string }>());

// Path Status
export const loadPathStatus = createAction('[Classroom Admin] Load Path Status', props<{ pathId: string }>());
export const loadPathStatusSuccess = createAction('[Classroom Admin] Load Path Status Success', props<{ status: PathStatus }>());

// Content List
export const loadContentList = createAction('[Classroom Admin] Load Content List', props<{ query: ContentListQuery }>());
export const loadContentListSuccess = createAction('[Classroom Admin] Load Content List Success', props<{ result: PaginatedContent }>());

// Generation
export const generateForPath = createAction('[Classroom Admin] Generate For Path', props<{ pathId: string; force?: boolean }>());
export const generateForPathSuccess = createAction('[Classroom Admin] Generate For Path Success', props<{ jobId: string }>());
export const generateForSubConcept = createAction('[Classroom Admin] Generate For SubConcept', props<{ subConceptId: string }>());

// Content Updates
export const updateContent = createAction('[Classroom Admin] Update Content', props<{ contentId: string; updates: ContentUpdates }>());
export const approveContent = createAction('[Classroom Admin] Approve Content', props<{ contentId: string }>());

// Real-time Progress
export const progressUpdate = createAction('[Classroom Admin] Progress Update', props<{ event: ClassroomProgressEvent }>());

// Jobs
export const loadJobs = createAction('[Classroom Admin] Load Jobs');
export const cancelJob = createAction('[Classroom Admin] Cancel Job', props<{ jobId: string }>());
```

#### Feature (`classroom-admin.feature.ts`)

```typescript
export interface ClassroomAdminState {
  overview: OverviewStats | null;
  selectedPathStatus: PathStatus | null;
  contentList: {
    items: ClassroomContent[];
    total: number;
    page: number;
    loading: boolean;
  };
  jobs: ClassroomJob[];
  activeJobId: string | null;
  latestEvent: ClassroomProgressEvent | null;
  loading: boolean;
  error: string | null;
}
```

#### Facade (`classroom-admin.facade.ts`)

```typescript
@Injectable({ providedIn: 'root' })
export class ClassroomAdminFacade {
  // Selectors
  overview$ = this.store.select(selectOverview);
  selectedPathStatus$ = this.store.select(selectSelectedPathStatus);
  contentList$ = this.store.select(selectContentList);
  jobs$ = this.store.select(selectJobs);
  isGenerating$ = this.store.select(selectIsGenerating);
  latestEvent$ = this.store.select(selectLatestEvent);

  // Actions
  loadOverview() { this.store.dispatch(loadOverview()); }
  loadPathStatus(pathId: string) { this.store.dispatch(loadPathStatus({ pathId })); }
  loadContentList(query: ContentListQuery) { this.store.dispatch(loadContentList({ query })); }
  generateForPath(pathId: string, force?: boolean) { this.store.dispatch(generateForPath({ pathId, force })); }
  generateForSubConcept(subConceptId: string) { this.store.dispatch(generateForSubConcept({ subConceptId })); }
  updateContent(contentId: string, updates: ContentUpdates) { this.store.dispatch(updateContent({ contentId, updates })); }
  approveContent(contentId: string) { this.store.dispatch(approveContent({ contentId })); }
  cancelJob(jobId: string) { this.store.dispatch(cancelJob({ jobId })); }

  // WebSocket subscription
  subscribeToPathProgress(pathId: string) { /* Socket.IO subscription */ }
  unsubscribeFromPathProgress() { /* Cleanup */ }
}
```

### 2.2 Create Classroom Admin Service

**File:** `libs/core-data/src/lib/services/classroom-admin/classroom-admin.service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class ClassroomAdminService {
  private apiUrl = inject(API_URL);
  private http = inject(HttpClient);

  getOverview() { return this.http.get<OverviewStats>(`${this.apiUrl}/admin/classroom/overview`); }
  getPathStatus(pathId: string) { return this.http.get<PathStatus>(`${this.apiUrl}/admin/classroom/paths/${pathId}/status`); }
  getContentList(query: ContentListQuery) { return this.http.get<PaginatedContent>(`${this.apiUrl}/admin/classroom/content`, { params: query }); }
  getContent(contentId: string) { return this.http.get<ClassroomContent>(`${this.apiUrl}/admin/classroom/content/${contentId}`); }
  generateForPath(pathId: string, force?: boolean) { return this.http.post(`${this.apiUrl}/admin/classroom/paths/${pathId}/generate`, { force }); }
  generateForSubConcept(subConceptId: string) { return this.http.post(`${this.apiUrl}/admin/classroom/sub-concepts/${subConceptId}/generate`, {}); }
  updateContent(contentId: string, updates: ContentUpdates) { return this.http.patch(`${this.apiUrl}/admin/classroom/content/${contentId}`, updates); }
  approveContent(contentId: string) { return this.http.post(`${this.apiUrl}/admin/classroom/content/${contentId}/approve`, {}); }
  clearPathContent(pathId: string) { return this.http.delete(`${this.apiUrl}/admin/classroom/paths/${pathId}/content`); }
  getJobs() { return this.http.get<ClassroomJob[]>(`${this.apiUrl}/admin/classroom/jobs`); }
  cancelJob(jobId: string) { return this.http.delete(`${this.apiUrl}/admin/classroom/jobs/${jobId}`); }
}
```

---

## Phase 3: Frontend Components

### 3.1 Directory Structure

```
apps/dashboard/src/app/admin/classroom/
├── classroom-admin.ts              # Main container component
├── classroom-admin.html            # Template
├── classroom-admin.scss            # Styles
├── components/
│   ├── overview-stats/             # Stats cards at top
│   │   ├── overview-stats.ts
│   │   └── overview-stats.html
│   ├── path-selector/              # Dropdown to select learning path
│   │   ├── path-selector.ts
│   │   └── path-selector.html
│   ├── content-status-tree/        # Hierarchical view: Path > Concept > SubConcept
│   │   ├── content-status-tree.ts
│   │   └── content-status-tree.html
│   ├── content-list/               # Paginated table of all content
│   │   ├── content-list.ts
│   │   └── content-list.html
│   ├── content-editor/             # Edit content dialog/panel
│   │   ├── content-editor.ts
│   │   └── content-editor.html
│   ├── generation-progress/        # Real-time progress display
│   │   ├── generation-progress.ts
│   │   └── generation-progress.html
│   └── job-history/                # List of generation jobs
│       ├── job-history.ts
│       └── job-history.html
```

### 3.2 Main Component (`classroom-admin.ts`)

```typescript
@Component({
  selector: 'app-classroom-admin',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    OverviewStats,
    PathSelector,
    ContentStatusTree,
    ContentList,
    ContentEditor,
    GenerationProgress,
    JobHistory,
  ],
  templateUrl: './classroom-admin.html',
  styleUrl: './classroom-admin.scss',
})
export class ClassroomAdmin implements OnInit, OnDestroy {
  private facade = inject(ClassroomAdminFacade);
  private learningPathsFacade = inject(LearningPathsFacade);

  // Data
  learningPaths = toSignal(this.learningPathsFacade.allLearningPaths$, { initialValue: [] });
  overview = toSignal(this.facade.overview$);
  selectedPathStatus = toSignal(this.facade.selectedPathStatus$);
  contentList = toSignal(this.facade.contentList$);
  jobs = toSignal(this.facade.jobs$);
  latestEvent = toSignal(this.facade.latestEvent$);

  // UI State
  selectedPathId = signal<string | null>(null);
  activeTab = signal<'tree' | 'list' | 'jobs'>('tree');
  isGenerating = toSignal(this.facade.isGenerating$, { initialValue: false });
  editingContentId = signal<string | null>(null);

  // Computed
  selectedPath = computed(() => {
    const id = this.selectedPathId();
    return id ? this.learningPaths().find(p => p.id === id) : null;
  });

  ngOnInit() {
    this.learningPathsFacade.loadLearningPaths();
    this.facade.loadOverview();
    this.facade.loadJobs();
  }

  // Load path status when selection changes
  pathSelected = effect(() => {
    const pathId = this.selectedPathId();
    if (pathId) {
      this.facade.loadPathStatus(pathId);
      this.facade.subscribeToPathProgress(pathId);
    }
  });

  ngOnDestroy() {
    this.facade.unsubscribeFromPathProgress();
  }

  // Actions
  generateForPath(pathId: string) {
    if (confirm('Generate classroom content for entire learning path?')) {
      this.facade.generateForPath(pathId);
    }
  }

  generateForSubConcept(subConceptId: string) {
    this.facade.generateForSubConcept(subConceptId);
  }

  regenerateContent(contentId: string) {
    // Find sub-concept ID and regenerate
  }

  editContent(contentId: string) {
    this.editingContentId.set(contentId);
  }

  saveContent(contentId: string, updates: ContentUpdates) {
    this.facade.updateContent(contentId, updates);
    this.editingContentId.set(null);
  }

  approveContent(contentId: string) {
    this.facade.approveContent(contentId);
  }

  cancelJob(jobId: string) {
    if (confirm('Cancel this generation job?')) {
      this.facade.cancelJob(jobId);
    }
  }
}
```

### 3.3 Template (`classroom-admin.html`)

```html
<div class="classroom-admin">
  <!-- Header -->
  <div class="admin-header">
    <h1>Classroom Content Management</h1>
    <p class="subtitle">Generate, edit, and manage classroom reading content</p>
  </div>

  <!-- Overview Stats -->
  <app-overview-stats [stats]="overview()" />

  <!-- Path Selection & Actions -->
  <div class="path-actions">
    <app-path-selector
      [paths]="learningPaths()"
      [selectedId]="selectedPathId()"
      (selectionChange)="selectedPathId.set($event)"
    />

    @if (selectedPathId()) {
      <div class="action-buttons">
        <button
          class="btn-primary"
          (click)="generateForPath(selectedPathId()!)"
          [disabled]="isGenerating()">
          @if (isGenerating()) {
            <span class="spinner"></span> Generating...
          } @else {
            Generate All Content
          }
        </button>
      </div>
    }
  </div>

  <!-- Generation Progress (when active) -->
  @if (isGenerating()) {
    <app-generation-progress
      [pathStatus]="selectedPathStatus()"
      [latestEvent]="latestEvent()"
    />
  }

  <!-- Tabs -->
  <div class="tabs">
    <button
      [class.active]="activeTab() === 'tree'"
      (click)="activeTab.set('tree')">
      Content Tree
    </button>
    <button
      [class.active]="activeTab() === 'list'"
      (click)="activeTab.set('list')">
      Content List
    </button>
    <button
      [class.active]="activeTab() === 'jobs'"
      (click)="activeTab.set('jobs')">
      Job History
    </button>
  </div>

  <!-- Tab Content -->
  @switch (activeTab()) {
    @case ('tree') {
      @if (selectedPathStatus()) {
        <app-content-status-tree
          [pathStatus]="selectedPathStatus()!"
          (generateSubConcept)="generateForSubConcept($event)"
          (editContent)="editContent($event)"
          (approveContent)="approveContent($event)"
        />
      } @else {
        <div class="empty-state">
          Select a learning path to view content status
        </div>
      }
    }

    @case ('list') {
      <app-content-list
        [content]="contentList()"
        (edit)="editContent($event)"
        (regenerate)="regenerateContent($event)"
        (approve)="approveContent($event)"
      />
    }

    @case ('jobs') {
      <app-job-history
        [jobs]="jobs()"
        (cancel)="cancelJob($event)"
      />
    }
  }

  <!-- Content Editor Dialog -->
  @if (editingContentId()) {
    <app-content-editor
      [contentId]="editingContentId()!"
      (save)="saveContent($event.id, $event.updates)"
      (cancel)="editingContentId.set(null)"
    />
  }
</div>
```

### 3.4 Content Status Tree Component

Shows hierarchical view of content status:

```
Learning Path: "Data Science Fundamentals"
├── Concept: "Data Fundamentals" [3/5 ready]
│   ├── SubConcept: "What is Data?" ✅ Ready [View] [Edit]
│   ├── SubConcept: "Data Types" ✅ Ready [View] [Edit]
│   ├── SubConcept: "Data Sources" 🔄 Generating...
│   ├── SubConcept: "Data Quality" ❌ Error [Retry]
│   └── SubConcept: "Data Ethics" ⏳ Pending [Generate]
├── Concept: "Statistics Basics" [0/4 ready]
│   └── ...
```

### 3.5 Content Editor Component

Full-featured editor for classroom content:

```typescript
@Component({...})
export class ContentEditor implements OnInit {
  @Input() contentId!: string;
  @Output() save = new EventEmitter<{ id: string; updates: ContentUpdates }>();
  @Output() cancel = new EventEmitter<void>();

  private service = inject(ClassroomAdminService);

  content = signal<ClassroomContent | null>(null);
  loading = signal(true);

  // Editable fields
  title = signal('');
  summary = signal('');
  sections = signal<ClassroomSection[]>([]);

  ngOnInit() {
    this.loadContent();
  }

  async loadContent() {
    this.loading.set(true);
    const content = await firstValueFrom(this.service.getContent(this.contentId));
    this.content.set(content);
    this.title.set(content.title);
    this.summary.set(content.summary);
    this.sections.set([...content.sections]);
    this.loading.set(false);
  }

  updateSection(index: number, updates: Partial<ClassroomSection>) {
    this.sections.update(sections => {
      const updated = [...sections];
      updated[index] = { ...updated[index], ...updates };
      return updated;
    });
  }

  addSection(type: SectionType) {
    const newSection: ClassroomSection = {
      id: crypto.randomUUID(),
      order: this.sections().length,
      type,
      content: '',
    };
    this.sections.update(s => [...s, newSection]);
  }

  removeSection(index: number) {
    this.sections.update(s => s.filter((_, i) => i !== index));
  }

  reorderSections(fromIndex: number, toIndex: number) {
    this.sections.update(sections => {
      const updated = [...sections];
      const [removed] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, removed);
      return updated.map((s, i) => ({ ...s, order: i }));
    });
  }

  saveChanges() {
    this.save.emit({
      id: this.contentId,
      updates: {
        title: this.title(),
        summary: this.summary(),
        sections: this.sections(),
      },
    });
  }
}
```

### 3.6 Generation Progress Component

Real-time progress display:

```typescript
@Component({...})
export class GenerationProgress {
  @Input() pathStatus!: PathStatus;
  @Input() latestEvent: ClassroomProgressEvent | null = null;

  // Computed progress
  progress = computed(() => {
    const status = this.pathStatus;
    if (!status) return { completed: 0, total: 0, percentage: 0 };

    let completed = 0;
    let total = 0;

    for (const concept of status.concepts) {
      for (const sc of concept.subConcepts) {
        total++;
        if (sc.content?.status === 'ready') completed++;
      }
    }

    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  });

  // Current activity message
  currentActivity = computed(() => {
    const event = this.latestEvent;
    if (!event) return 'Starting...';
    return event.message;
  });
}
```

---

## Phase 4: Add Route

### 4.1 Update Routes

**File:** `apps/dashboard/src/app/app.routes.ts`

```typescript
// In admin children:
{
  path: 'classroom',
  loadComponent: () =>
    import('./admin/classroom/classroom-admin').then((m) => m.ClassroomAdmin),
},
```

### 4.2 Update Sidebar

**File:** `apps/dashboard/src/app/shared/sidebar/sidebar.ts`

Add to Admin section:
```typescript
{ label: 'Classroom Content', path: '/admin/classroom', icon: 'classroom' },
```

---

## Phase 5: Testing & Polish

### 5.1 Manual Testing Checklist

- [ ] Overview stats display correctly
- [ ] Path selection loads status
- [ ] Content tree shows correct hierarchy
- [ ] Status indicators show correct states (pending/generating/ready/error)
- [ ] Generate button triggers job
- [ ] Real-time progress updates work
- [ ] Content list pagination works
- [ ] Content editing saves correctly
- [ ] Approve button updates status
- [ ] Job history shows past jobs
- [ ] Cancel job works
- [ ] Error states display correctly
- [ ] Retry failed content works

### 5.2 Edge Cases

- Empty learning path (no concepts)
- Path with no sub-concepts
- Generation job fails midway
- Network disconnection during generation
- Multiple simultaneous generations
- Very long content editing

---

## Implementation Order

1. **Backend API** (Phase 1) - ~2-3 hours
   - Admin controller with basic endpoints
   - Service methods
   - WebSocket gateway for events

2. **NgRx State** (Phase 2) - ~1-2 hours
   - Actions, reducers, selectors
   - Facade
   - Service

3. **Main Component Shell** (Phase 3.1-3.3) - ~1 hour
   - Basic layout
   - Path selection
   - Tab navigation

4. **Content Status Tree** (Phase 3.4) - ~1-2 hours
   - Hierarchical display
   - Status indicators
   - Action buttons

5. **Generation Progress** (Phase 3.6) - ~1 hour
   - Progress bar
   - Real-time updates
   - Activity log

6. **Content List** - ~1 hour
   - Paginated table
   - Filtering
   - Quick actions

7. **Content Editor** (Phase 3.5) - ~2-3 hours
   - Load content
   - Section editing
   - Drag-and-drop reorder
   - Save/cancel

8. **Job History** - ~30 min
   - Job list
   - Cancel button

9. **Polish & Testing** (Phase 5) - ~1-2 hours

**Total Estimated: 10-15 hours**

---

## Files to Create

### Backend
- `apps/api/src/classroom/classroom-admin.controller.ts`
- `apps/api/src/classroom/classroom.gateway.ts`
- `apps/api/src/classroom/dto/admin.dto.ts`

### State Management
- `libs/core-state/src/lib/classroom-admin/classroom-admin.actions.ts`
- `libs/core-state/src/lib/classroom-admin/classroom-admin.feature.ts`
- `libs/core-state/src/lib/classroom-admin/classroom-admin.effects.ts`
- `libs/core-state/src/lib/classroom-admin/classroom-admin.facade.ts`
- `libs/core-state/src/lib/classroom-admin/index.ts`
- `libs/core-data/src/lib/services/classroom-admin/classroom-admin.service.ts`

### Frontend
- `apps/dashboard/src/app/admin/classroom/classroom-admin.ts`
- `apps/dashboard/src/app/admin/classroom/classroom-admin.html`
- `apps/dashboard/src/app/admin/classroom/classroom-admin.scss`
- `apps/dashboard/src/app/admin/classroom/components/overview-stats/`
- `apps/dashboard/src/app/admin/classroom/components/path-selector/`
- `apps/dashboard/src/app/admin/classroom/components/content-status-tree/`
- `apps/dashboard/src/app/admin/classroom/components/content-list/`
- `apps/dashboard/src/app/admin/classroom/components/content-editor/`
- `apps/dashboard/src/app/admin/classroom/components/generation-progress/`
- `apps/dashboard/src/app/admin/classroom/components/job-history/`

### Updates
- `apps/dashboard/src/app/app.routes.ts` - Add route
- `apps/dashboard/src/app/shared/sidebar/sidebar.ts` - Add nav item
- `libs/core-state/src/index.ts` - Export new facade
- `libs/core-data/src/index.ts` - Export new service
- `apps/dashboard/src/app/app.config.ts` - Register effects
