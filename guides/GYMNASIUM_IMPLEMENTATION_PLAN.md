# Gymnasium Feature Implementation Plan

## Executive Summary

The **Gymnasium** is a standalone practice content system that enables users to create, share, and practice structured learning sessions. Think of it as "going to the gym" for any technical skill - users attend **Sessions** that guide them through hands-on practice with clear goals, commands, and exercises.

**Key Architectural Principle**: Complete separation of **Data** (session content) and **Presentation** (templates/themes). This enables:
- Same content rendered with different templates (dark theme, print-friendly, mobile)
- Same template reused across different sessions
- Easy theming, white-labeling, and export flexibility
- Content portability and API-first design

---

## Table of Contents

1. [Goals & Non-Goals](#1-goals--non-goals)
2. [Core Concepts](#2-core-concepts)
3. [Data Model](#3-data-model)
4. [Template System](#4-template-system)
5. [AI Generation](#5-ai-generation)
6. [API Design](#6-api-design)
7. [Frontend Architecture](#7-frontend-architecture)
8. [Milestones](#8-milestones)
9. [File Structure](#9-file-structure)
10. [Technical Decisions](#10-technical-decisions)
11. [Future Considerations](#11-future-considerations)

---

## 1. Goals & Non-Goals

### Goals

| Goal | Description |
|------|-------------|
| **Standalone** | Gymnasium has zero dependencies on other Kasita features (Learning Paths, Knowledge Units, etc.) |
| **Data/Presentation Separation** | Content (JSON) is completely separate from rendering (templates) |
| **AI-First Creation** | Primary content creation via AI generation from prompts |
| **Anyone Can Create** | No role restrictions - all users can create and share sessions |
| **Export-Ready** | Sessions can be exported to HTML, PDF, or other formats |
| **Marketing Tool** | Can be used as standalone content for marketing/lead generation |
| **Meaningful Repetitions** | Structure supports spaced practice and skill building |

### Non-Goals (for MVP)

| Non-Goal | Rationale |
|----------|-----------|
| Integration with Learning Paths | Keep standalone first; integrate later if needed |
| Submission/Grading | Sessions are self-paced practice, not assessed |
| Real-time Collaboration | Single-author for MVP |
| Version Control | No branching/merging of session content |
| Marketplace/Monetization | Future consideration |

---

## 2. Core Concepts

### Terminology

```
┌─────────────────────────────────────────────────────────────────┐
│  GYMNASIUM (Feature)                                            │
│  "The gym where you practice skills"                            │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  SESSION (Content Unit)                                  │   │
│  │  "A single practice workout"                             │   │
│  │                                                          │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │  PART (Major Section)                            │    │   │
│  │  │  "Chapter or phase of the workout"               │    │   │
│  │  │                                                  │    │   │
│  │  │  ┌─────────────────────────────────────────┐    │    │   │
│  │  │  │  SECTION (Topic)                         │    │    │   │
│  │  │  │  "Focused exercise set"                  │    │    │   │
│  │  │  │                                          │    │    │   │
│  │  │  │  ┌─────────────────────────────────┐    │    │    │   │
│  │  │  │  │  BLOCKS (Content)                │    │    │    │   │
│  │  │  │  │  prose | code | exercise | etc.  │    │    │    │   │
│  │  │  │  └─────────────────────────────────┘    │    │    │   │
│  │  │  └─────────────────────────────────────────┘    │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  TEMPLATE (Presentation)                                 │   │
│  │  "How to render the session"                             │   │
│  │  - HTML template + CSS                                   │   │
│  │  - Supports theming (dark, light, print)                 │   │
│  │  - Completely separate from content                      │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Usage Examples

```
"I created a Kubernetes gymnasium session for our team onboarding"
"Let me practice with the React Hooks session in the gymnasium"
"Export this session as a PDF for the workshop"
```

---

## 3. Data Model

### 3.1 Session Entity (Core Content)

```typescript
// The main content container
interface Session {
  id: string;

  // Metadata
  title: string;                    // "Kubernetes Fundamentals"
  subtitle?: string;                // "A Practitioner's Guide"
  description: string;              // For listings/SEO
  domain: string;                   // "DevOps", "Frontend", "API"
  tags: string[];                   // ["kubernetes", "docker", "devops"]
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimatedMinutes: number;         // Total estimated time

  // Cover/Branding
  badgeText?: string;               // "Practitioner's Guide"
  coverMeta?: string[];             // ["24 Exercises", "3 Methods"]

  // Ownership
  creatorId: string;
  visibility: 'private' | 'unlisted' | 'public';

  // Content (denormalized for performance and portability)
  parts: SessionPart[];

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

interface SessionPart {
  id: string;
  number: string;                   // "I", "II", "1", "Part One"
  title: string;                    // "Getting Started"
  description?: string;             // Part intro text
  sections: SessionSection[];
}

interface SessionSection {
  id: string;
  number?: number;                  // 1, 2, 3... (optional)
  title: string;                    // "Basic Resource Inspection"
  anchor: string;                   // URL-safe anchor: "basic-resource-inspection"
  blocks: ContentBlock[];
}
```

### 3.2 Content Blocks

```typescript
// Discriminated union for all block types
type ContentBlock =
  | ProseBlock
  | HeadingBlock
  | CodeBlock
  | CommandBlock
  | ExerciseBlock
  | TryThisBlock
  | CalloutBlock
  | DiagramBlock
  | StructureBlock
  | TableBlock
  | ChecklistBlock
  | KeyLearningBlock
  | DividerBlock;

// === Text Content ===

interface ProseBlock {
  type: 'prose';
  content: string;                  // Markdown or plain text
}

interface HeadingBlock {
  type: 'heading';
  level: 2 | 3 | 4;                 // h2, h3, h4
  text: string;
  anchor?: string;                  // For linking
}

// === Code Content ===

interface CodeBlock {
  type: 'code';
  language: string;                 // 'bash', 'typescript', 'yaml', 'json', etc.
  code: string;                     // The actual code
  label?: string;                   // Badge label like "YAML", "Example"
  filename?: string;                // Optional filename display
  highlights?: number[];            // Line numbers to highlight
}

interface CommandBlock {
  type: 'command';
  command: string;                  // Single command with $ prefix styling
}

interface StructureBlock {
  type: 'structure';
  content: string;                  // Directory tree (pre-formatted)
}

interface DiagramBlock {
  type: 'diagram';
  content: string;                  // ASCII art or diagram markup
  format: 'ascii' | 'mermaid';      // Rendering hint
}

// === Interactive/Exercise Content ===

interface ExerciseBlock {
  type: 'exercise';
  badge: string;                    // "Exercise 1", "Advanced", "Scenario"
  title: string;
  goal?: string;                    // What the user should achieve
  content: string;                  // Markdown content (can include code blocks)
}

interface TryThisBlock {
  type: 'tryThis';
  steps: string[];                  // Numbered steps, can include inline code
}

interface CalloutBlock {
  type: 'callout';
  variant: 'tip' | 'note' | 'warning' | 'info';
  title?: string;                   // Optional custom title
  content: string;                  // Markdown content
}

interface KeyLearningBlock {
  type: 'keyLearning';
  content: string;                  // Important takeaway
}

// === Structural Content ===

interface TableBlock {
  type: 'table';
  headers: string[];
  rows: string[][];
  caption?: string;
}

interface ChecklistBlock {
  type: 'checklist';
  title?: string;
  items: string[];
}

interface DividerBlock {
  type: 'divider';
  label?: string;                   // Optional section label
}
```

### 3.3 Template Entity

```typescript
interface SessionTemplate {
  id: string;
  name: string;                     // "Dark Professional"
  description: string;

  // Template content
  htmlTemplate: string;             // Handlebars/Mustache template
  cssStyles: string;                // CSS styles

  // Configuration
  supportsPrint: boolean;
  supportsDarkMode: boolean;

  // Ownership
  creatorId: string;
  isSystem: boolean;                // System templates can't be deleted

  createdAt: Date;
  updatedAt: Date;
}
```

### 3.4 User Progress (Optional - for tracking)

```typescript
interface SessionProgress {
  id: string;
  userId: string;
  sessionId: string;

  // Progress tracking
  currentPartIndex: number;
  currentSectionIndex: number;
  completedSections: string[];      // Section IDs

  // Timing
  startedAt: Date;
  lastActivityAt: Date;
  completedAt?: Date;
  totalTimeSeconds: number;
}
```

### 3.5 Database Schema (TypeORM)

```typescript
// session.entity.ts
@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  subtitle: string;

  @Column('text')
  description: string;

  @Column()
  domain: string;

  @Column('simple-array')
  tags: string[];

  @Column({ default: 'beginner' })
  difficulty: string;

  @Column({ default: 60 })
  estimatedMinutes: number;

  @Column({ nullable: true })
  badgeText: string;

  @Column('simple-json', { nullable: true })
  coverMeta: string[];

  @Column()
  creatorId: string;

  @Column({ default: 'private' })
  visibility: string;

  // Store entire content as JSON for portability
  @Column('simple-json')
  content: {
    parts: SessionPart[];
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  publishedAt: Date;
}
```

---

## 4. Template System

### 4.1 Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Session Data   │  +  │    Template     │  =  │  Rendered HTML  │
│  (JSON)         │     │  (Handlebars)   │     │  (Output)       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### 4.2 Template Variables

```handlebars
{{! Available variables in templates }}

{{session.title}}
{{session.subtitle}}
{{session.description}}
{{session.badgeText}}
{{session.domain}}
{{session.difficulty}}
{{session.estimatedMinutes}}

{{#each session.coverMeta}}
  {{this}}
{{/each}}

{{#each session.parts}}
  {{this.number}}
  {{this.title}}
  {{this.description}}

  {{#each this.sections}}
    {{this.number}}
    {{this.title}}
    {{this.anchor}}

    {{#each this.blocks}}
      {{#if (eq this.type "prose")}}
        {{this.content}}
      {{/if}}
      {{#if (eq this.type "code")}}
        {{this.language}}
        {{this.code}}
        {{this.label}}
      {{/if}}
      {{! ... other block types }}
    {{/each}}
  {{/each}}
{{/each}}
```

### 4.3 Default Template (Based on k8s-dojo)

The default template will be extracted from the k8s-dojo `docs/index.html`:

```
templates/
├── default/
│   ├── template.hbs          # Main HTML structure
│   ├── styles.css            # Dark theme styles
│   ├── blocks/               # Partial templates for each block type
│   │   ├── prose.hbs
│   │   ├── code.hbs
│   │   ├── exercise.hbs
│   │   ├── tryThis.hbs
│   │   ├── callout.hbs
│   │   └── ...
│   └── config.json           # Template metadata
├── print-friendly/
│   └── ...
└── light-theme/
    └── ...
```

### 4.4 Rendering Pipeline

```typescript
class SessionRenderer {
  async render(sessionId: string, templateId?: string): Promise<string> {
    // 1. Fetch session data
    const session = await this.sessionService.findOne(sessionId);

    // 2. Fetch template (or use default)
    const template = templateId
      ? await this.templateService.findOne(templateId)
      : await this.templateService.getDefault();

    // 3. Compile template
    const compiled = Handlebars.compile(template.htmlTemplate);

    // 4. Register block partials
    this.registerBlockPartials(template);

    // 5. Render
    const html = compiled({
      session,
      generatedAt: new Date().toISOString(),
    });

    // 6. Inject styles
    return this.injectStyles(html, template.cssStyles);
  }
}
```

---

## 5. AI Generation

### 5.1 Generation Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  User Prompt    │ ──▶ │  AI Generation  │ ──▶ │  Session JSON   │
│                 │     │  (Claude API)   │     │                 │
│  "Create a      │     │                 │     │  {              │
│   Kubernetes    │     │  System prompt  │     │    title: ...,  │
│   fundamentals  │     │  + user prompt  │     │    parts: [...] │
│   session"      │     │  = structured   │     │  }              │
│                 │     │    output       │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### 5.2 Generation Prompt Structure

```typescript
interface GenerationRequest {
  // Required
  topic: string;                    // "Kubernetes Fundamentals"

  // Optional customization
  targetAudience?: string;          // "DevOps engineers new to K8s"
  difficulty?: string;              // "beginner"
  estimatedLength?: string;         // "60 minutes"
  focusAreas?: string[];            // ["kubectl", "pods", "services"]
  includeExercises?: boolean;       // true
  codeLanguage?: string;            // "bash"

  // Style
  tone?: string;                    // "professional", "casual", "academic"
}
```

### 5.3 System Prompt for AI Generation

```typescript
const GENERATION_SYSTEM_PROMPT = `
You are an expert technical educator creating structured practice sessions.

OUTPUT FORMAT:
You must return valid JSON matching this exact schema:

{
  "title": "string",
  "subtitle": "string (optional)",
  "description": "string",
  "domain": "string",
  "tags": ["string"],
  "difficulty": "beginner|intermediate|advanced|expert",
  "estimatedMinutes": number,
  "badgeText": "string (optional)",
  "coverMeta": ["string"] (optional),
  "parts": [
    {
      "id": "unique-string",
      "number": "I|II|III or 1|2|3",
      "title": "string",
      "description": "string (optional)",
      "sections": [
        {
          "id": "unique-string",
          "number": number (optional),
          "title": "string",
          "anchor": "url-safe-string",
          "blocks": [
            // Block objects (see block types below)
          ]
        }
      ]
    }
  ]
}

BLOCK TYPES:
1. prose: { "type": "prose", "content": "markdown text" }
2. heading: { "type": "heading", "level": 2|3|4, "text": "string" }
3. code: { "type": "code", "language": "string", "code": "string", "label": "optional" }
4. command: { "type": "command", "command": "single command string" }
5. exercise: { "type": "exercise", "badge": "string", "title": "string", "goal": "optional", "content": "markdown" }
6. tryThis: { "type": "tryThis", "steps": ["step 1", "step 2"] }
7. callout: { "type": "callout", "variant": "tip|note|warning|info", "title": "optional", "content": "markdown" }
8. table: { "type": "table", "headers": ["col1", "col2"], "rows": [["val1", "val2"]] }
9. checklist: { "type": "checklist", "items": ["item1", "item2"] }
10. keyLearning: { "type": "keyLearning", "content": "important takeaway" }
11. diagram: { "type": "diagram", "content": "ascii art", "format": "ascii" }
12. structure: { "type": "structure", "content": "directory tree" }
13. divider: { "type": "divider", "label": "optional section name" }

GUIDELINES:
- Create logical progression from basic to advanced
- Include practical, hands-on exercises
- Use "tryThis" blocks for quick practice opportunities
- Use "exercise" blocks for more comprehensive challenges
- Include "callout" blocks for tips and warnings
- Use "keyLearning" blocks to highlight important concepts
- Ensure code examples are realistic and runnable
- Generate unique IDs for parts and sections (use kebab-case)
`;
```

### 5.4 AI Service Implementation

```typescript
@Injectable()
export class SessionGeneratorService {
  constructor(
    private readonly anthropicService: AnthropicService,
  ) {}

  async generateSession(request: GenerationRequest): Promise<SessionContent> {
    const userPrompt = this.buildUserPrompt(request);

    const response = await this.anthropicService.complete({
      model: 'claude-sonnet-4-20250514',
      maxTokens: 8000,
      system: GENERATION_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });

    // Parse and validate JSON
    const content = this.parseResponse(response);
    this.validateContent(content);

    return content;
  }

  private buildUserPrompt(request: GenerationRequest): string {
    return `
Create a comprehensive practice session for: "${request.topic}"

Target audience: ${request.targetAudience || 'General practitioners'}
Difficulty: ${request.difficulty || 'intermediate'}
Estimated length: ${request.estimatedLength || '45-60 minutes'}
${request.focusAreas ? `Focus areas: ${request.focusAreas.join(', ')}` : ''}
${request.codeLanguage ? `Primary code language: ${request.codeLanguage}` : ''}

Create a well-structured session with multiple parts and sections.
Include a mix of explanations, code examples, and hands-on exercises.
    `.trim();
  }
}
```

---

## 6. API Design

### 6.1 Endpoints

```
Sessions (CRUD)
───────────────────────────────────────────────────────────────
GET    /api/gymnasium/sessions              List sessions (with filters)
POST   /api/gymnasium/sessions              Create session
GET    /api/gymnasium/sessions/:id          Get session by ID
PATCH  /api/gymnasium/sessions/:id          Update session
DELETE /api/gymnasium/sessions/:id          Delete session

Generation
───────────────────────────────────────────────────────────────
POST   /api/gymnasium/sessions/generate     Generate session via AI

Export/Render
───────────────────────────────────────────────────────────────
GET    /api/gymnasium/sessions/:id/render   Render as HTML
GET    /api/gymnasium/sessions/:id/export   Export (HTML file download)
GET    /api/gymnasium/sessions/:id/raw      Get raw JSON content

Templates
───────────────────────────────────────────────────────────────
GET    /api/gymnasium/templates             List templates
GET    /api/gymnasium/templates/:id         Get template
POST   /api/gymnasium/templates             Create template (admin)
PATCH  /api/gymnasium/templates/:id         Update template
DELETE /api/gymnasium/templates/:id         Delete template

Progress (Optional)
───────────────────────────────────────────────────────────────
GET    /api/gymnasium/progress              Get user's progress
POST   /api/gymnasium/progress              Update progress
GET    /api/gymnasium/progress/:sessionId   Get progress for session
```

### 6.2 Request/Response Examples

```typescript
// POST /api/gymnasium/sessions/generate
// Request:
{
  "topic": "React Hooks Deep Dive",
  "targetAudience": "Frontend developers familiar with React basics",
  "difficulty": "intermediate",
  "estimatedLength": "90 minutes",
  "focusAreas": ["useState", "useEffect", "useContext", "custom hooks"],
  "codeLanguage": "typescript"
}

// Response:
{
  "id": "generated-uuid",
  "title": "React Hooks Deep Dive",
  "subtitle": "Master Modern React State Management",
  // ... full session object
}

// GET /api/gymnasium/sessions/:id/render?template=dark-professional
// Response: HTML string

// GET /api/gymnasium/sessions/:id/export?format=html
// Response: File download (Content-Disposition: attachment)
```

---

## 7. Frontend Architecture

### 7.1 Component Structure

```
apps/dashboard/src/app/gymnasium/
├── gymnasium.ts                          # Main route component
├── gymnasium.routes.ts                   # Route definitions
├── gymnasium.scss                        # Shared styles
│
├── session-list/                         # Browse/search sessions
│   ├── session-list.ts
│   ├── session-list.html
│   ├── session-list.scss
│   └── session-card/                     # Session preview card
│       └── session-card.ts
│
├── session-viewer/                       # Read/practice a session
│   ├── session-viewer.ts
│   ├── session-viewer.html
│   ├── session-viewer.scss
│   ├── session-toc/                      # Table of contents sidebar
│   │   └── session-toc.ts
│   ├── session-progress-bar/             # Progress indicator
│   │   └── session-progress-bar.ts
│   └── blocks/                           # Block renderers
│       ├── block-renderer.ts             # Dynamic block dispatcher
│       ├── prose-block.ts
│       ├── code-block.ts
│       ├── exercise-block.ts
│       ├── try-this-block.ts
│       ├── callout-block.ts
│       ├── table-block.ts
│       ├── diagram-block.ts
│       └── ...
│
├── session-generator/                    # AI generation UI
│   ├── session-generator.ts
│   ├── session-generator.html
│   ├── session-generator.scss
│   └── generation-form/
│       └── generation-form.ts
│
├── session-editor/                       # Edit session content
│   ├── session-editor.ts
│   ├── session-editor.html
│   ├── session-editor.scss
│   ├── block-editor/                     # Edit individual blocks
│   │   └── block-editor.ts
│   └── part-editor/                      # Edit parts/sections
│       └── part-editor.ts
│
└── services/
    ├── gymnasium.service.ts              # API calls
    └── session-renderer.service.ts       # Client-side rendering
```

### 7.2 Routes

```typescript
// gymnasium.routes.ts
export const GYMNASIUM_ROUTES: Routes = [
  {
    path: 'gymnasium',
    children: [
      { path: '', component: SessionList },
      { path: 'generate', component: SessionGenerator },
      { path: 'session/:id', component: SessionViewer },
      { path: 'session/:id/edit', component: SessionEditor },
    ]
  }
];
```

### 7.3 Block Renderer Pattern

```typescript
// block-renderer.ts
@Component({
  selector: 'app-block-renderer',
  template: `
    @switch (block.type) {
      @case ('prose') {
        <app-prose-block [block]="block" />
      }
      @case ('code') {
        <app-code-block [block]="block" />
      }
      @case ('exercise') {
        <app-exercise-block [block]="block" />
      }
      @case ('tryThis') {
        <app-try-this-block [block]="block" />
      }
      @case ('callout') {
        <app-callout-block [block]="block" />
      }
      // ... other block types
    }
  `
})
export class BlockRenderer {
  @Input() block!: ContentBlock;
}
```

---

## 8. Milestones

### Milestone 1: Foundation (Backend Core)
**Duration**: 2-3 days
**Goal**: Basic CRUD for sessions with JSON content storage

#### Deliverables:
- [ ] Create `gymnasium` module in NestJS
- [ ] `Session` entity with JSON content column
- [ ] `SessionTemplate` entity for templates
- [ ] Basic CRUD endpoints for sessions
- [ ] Seed one template (extracted from k8s-dojo)
- [ ] Manual session creation via API

#### Files to Create:
```
apps/api/src/gymnasium/
├── gymnasium.module.ts
├── gymnasium.controller.ts
├── gymnasium.service.ts
├── entities/
│   ├── session.entity.ts
│   └── session-template.entity.ts
├── dto/
│   ├── create-session.dto.ts
│   └── update-session.dto.ts
└── templates/
    └── default-template.ts
```

#### Acceptance Criteria:
- Can create a session via POST with full JSON content
- Can retrieve session with all nested content
- Can list sessions with pagination
- Can update and delete sessions

---

### Milestone 2: Rendering Engine
**Duration**: 2-3 days
**Goal**: Render sessions to HTML using templates

#### Deliverables:
- [ ] Handlebars template engine integration
- [ ] Default template with full CSS (from k8s-dojo)
- [ ] Block partial templates for each block type
- [ ] `/render` endpoint returning HTML
- [ ] `/export` endpoint for file download
- [ ] Print-friendly CSS support

#### Files to Create:
```
apps/api/src/gymnasium/
├── rendering/
│   ├── session-renderer.service.ts
│   ├── handlebars-helpers.ts
│   └── templates/
│       ├── default/
│       │   ├── main.hbs
│       │   ├── styles.css
│       │   └── partials/
│       │       ├── cover.hbs
│       │       ├── toc.hbs
│       │       ├── part.hbs
│       │       ├── section.hbs
│       │       └── blocks/
│       │           ├── prose.hbs
│       │           ├── code.hbs
│       │           └── ...
│       └── print/
│           └── ...
```

#### Acceptance Criteria:
- GET `/sessions/:id/render` returns complete HTML page
- HTML matches k8s-dojo styling quality
- All block types render correctly
- Print to PDF produces clean output

---

### Milestone 3: AI Generation
**Duration**: 3-4 days
**Goal**: Generate sessions from prompts using Claude API

#### Deliverables:
- [ ] Anthropic API integration (if not already present)
- [ ] Generation service with system prompt
- [ ] `/generate` endpoint
- [ ] Structured output parsing and validation
- [ ] Error handling for malformed AI responses
- [ ] Generation options (difficulty, length, focus areas)

#### Files to Create:
```
apps/api/src/gymnasium/
├── generation/
│   ├── session-generator.service.ts
│   ├── generation-prompt.ts
│   ├── dto/
│   │   └── generate-session.dto.ts
│   └── validators/
│       └── content-validator.ts
```

#### Acceptance Criteria:
- Can generate complete session from topic prompt
- Generated content follows correct JSON schema
- All block types are properly formatted
- Generation takes < 30 seconds
- Handles API errors gracefully

---

### Milestone 4: Frontend - Session List & Viewer
**Duration**: 3-4 days
**Goal**: Browse and read sessions in the dashboard

#### Deliverables:
- [ ] Session list page with cards
- [ ] Search and filter by domain/difficulty/tags
- [ ] Session viewer with TOC sidebar
- [ ] All block type renderers
- [ ] Code syntax highlighting (Prism or Highlight.js)
- [ ] Mobile-responsive layout
- [ ] Reading progress indicator

#### Files to Create:
```
apps/dashboard/src/app/gymnasium/
├── gymnasium.ts
├── gymnasium.routes.ts
├── session-list/
│   ├── session-list.ts
│   └── session-card/
├── session-viewer/
│   ├── session-viewer.ts
│   ├── session-toc/
│   └── blocks/
│       ├── block-renderer.ts
│       ├── prose-block.ts
│       ├── code-block.ts
│       └── ... (all block types)
└── services/
    └── gymnasium.service.ts
```

#### Acceptance Criteria:
- Can browse all public sessions
- Can search/filter sessions
- Session viewer renders all block types
- Code blocks have syntax highlighting
- TOC navigation works
- Responsive on mobile

---

### Milestone 5: Frontend - Generation UI
**Duration**: 2-3 days
**Goal**: UI for generating new sessions via AI

#### Deliverables:
- [ ] Generation form with all options
- [ ] Real-time generation status
- [ ] Preview generated content
- [ ] Edit before saving
- [ ] Save to library

#### Files to Create:
```
apps/dashboard/src/app/gymnasium/
├── session-generator/
│   ├── session-generator.ts
│   ├── generation-form/
│   └── generation-preview/
```

#### Acceptance Criteria:
- Form captures all generation options
- Shows loading state during generation
- Displays preview of generated content
- Can edit content before saving
- Successfully saves to database

---

### Milestone 6: Session Editor (Optional Enhancement)
**Duration**: 3-4 days
**Goal**: Edit session content manually

#### Deliverables:
- [ ] Edit session metadata
- [ ] Add/remove/reorder parts and sections
- [ ] Block editor for each block type
- [ ] Live preview
- [ ] Auto-save or save button

#### Acceptance Criteria:
- Can edit all session fields
- Can add new blocks of any type
- Can reorder content via drag-drop
- Changes persist correctly
- Preview matches final output

---

### Milestone 7: Progress Tracking (Optional Enhancement)
**Duration**: 2-3 days
**Goal**: Track user progress through sessions

#### Deliverables:
- [ ] Progress entity and API
- [ ] Mark sections complete
- [ ] Resume from last position
- [ ] Progress dashboard

#### Acceptance Criteria:
- Progress persists across sessions
- Can resume from where user left off
- Progress visible in session list

---

## 9. File Structure

### Backend (Complete)

```
apps/api/src/gymnasium/
├── gymnasium.module.ts
├── gymnasium.controller.ts
├── gymnasium.service.ts
│
├── entities/
│   ├── session.entity.ts
│   ├── session-template.entity.ts
│   └── session-progress.entity.ts
│
├── dto/
│   ├── create-session.dto.ts
│   ├── update-session.dto.ts
│   ├── generate-session.dto.ts
│   └── session-query.dto.ts
│
├── generation/
│   ├── session-generator.service.ts
│   ├── generation-prompts.ts
│   └── content-validator.ts
│
├── rendering/
│   ├── session-renderer.service.ts
│   ├── handlebars-helpers.ts
│   └── templates/
│       └── default/
│           ├── main.hbs
│           ├── styles.css
│           └── partials/
│               ├── cover.hbs
│               ├── toc.hbs
│               ├── part.hbs
│               ├── section.hbs
│               └── blocks/
│                   ├── prose.hbs
│                   ├── code.hbs
│                   ├── exercise.hbs
│                   ├── try-this.hbs
│                   ├── callout.hbs
│                   ├── table.hbs
│                   ├── checklist.hbs
│                   ├── diagram.hbs
│                   ├── structure.hbs
│                   ├── key-learning.hbs
│                   └── divider.hbs
│
└── interfaces/
    ├── session-content.interface.ts
    └── block-types.interface.ts
```

### Frontend (Complete)

```
apps/dashboard/src/app/gymnasium/
├── gymnasium.ts
├── gymnasium.routes.ts
├── gymnasium.scss
│
├── session-list/
│   ├── session-list.ts
│   ├── session-list.html
│   ├── session-list.scss
│   └── session-card/
│       ├── session-card.ts
│       ├── session-card.html
│       └── session-card.scss
│
├── session-viewer/
│   ├── session-viewer.ts
│   ├── session-viewer.html
│   ├── session-viewer.scss
│   ├── session-toc/
│   │   ├── session-toc.ts
│   │   └── session-toc.scss
│   ├── session-progress-bar/
│   │   └── session-progress-bar.ts
│   └── blocks/
│       ├── block-renderer.ts
│       ├── prose-block.ts
│       ├── code-block.ts
│       ├── exercise-block.ts
│       ├── try-this-block.ts
│       ├── callout-block.ts
│       ├── table-block.ts
│       ├── checklist-block.ts
│       ├── diagram-block.ts
│       ├── structure-block.ts
│       ├── key-learning-block.ts
│       └── divider-block.ts
│
├── session-generator/
│   ├── session-generator.ts
│   ├── session-generator.html
│   ├── session-generator.scss
│   └── generation-form/
│       ├── generation-form.ts
│       └── generation-form.html
│
├── session-editor/
│   ├── session-editor.ts
│   ├── session-editor.html
│   ├── session-editor.scss
│   ├── metadata-editor/
│   │   └── metadata-editor.ts
│   ├── part-editor/
│   │   └── part-editor.ts
│   └── block-editor/
│       └── block-editor.ts
│
└── services/
    └── gymnasium.service.ts
```

### Shared Types

```
libs/common-models/src/lib/
├── gymnasium/
│   ├── session.interface.ts
│   ├── content-blocks.interface.ts
│   ├── session-template.interface.ts
│   └── index.ts
```

---

## 10. Technical Decisions

### 10.1 Content Storage

**Decision**: Store content as denormalized JSON in a single column

**Rationale**:
- Sessions are read-heavy, write-light
- Avoids complex joins for nested content
- Easy export/import of entire sessions
- Content is always loaded together
- Supports full-text search on JSON (PostgreSQL)

**Trade-offs**:
- Can't query individual blocks efficiently
- Updates require full content replacement
- Acceptable for this use case

### 10.2 Template Engine

**Decision**: Handlebars for server-side HTML generation

**Rationale**:
- Logic-less templates (separation of concerns)
- Familiar syntax
- Good partial support for block types
- Works server-side (Node.js)
- Easy to learn for template creators

**Alternatives Considered**:
- EJS: Too much logic in templates
- Pug: Unfamiliar syntax for non-devs
- React SSR: Overkill for static content

### 10.3 AI Model

**Decision**: Claude claude-sonnet-4-20250514 for generation

**Rationale**:
- Excellent at structured output
- Good balance of quality and speed
- Cost-effective for content generation
- Strong at technical content

### 10.4 Frontend Rendering

**Decision**: Angular components for viewer, not raw HTML injection

**Rationale**:
- Interactive features (progress tracking, navigation)
- Consistent styling with dashboard
- Better accessibility
- Code syntax highlighting integration

---

## 11. Future Considerations

### Not in MVP, but designed for:

1. **Learning Path Integration**
   - Optional `learningPathId` field on Session
   - Sessions can be standalone or part of paths

2. **Forking/Remixing**
   - Fork a public session to customize
   - Track lineage of forked content

3. **Collaborative Editing**
   - Multiple editors on a session
   - Version history

4. **Marketplace**
   - Sell premium sessions
   - Creator analytics

5. **Interactive Exercises**
   - Code execution sandbox
   - Automated validation
   - Quiz blocks with scoring

6. **Spaced Repetition**
   - Link sessions to review schedule
   - "Practice again" recommendations

7. **Mobile App**
   - Offline session downloads
   - Native mobile viewer

8. **Analytics**
   - Track which sections take longest
   - Identify difficult exercises
   - Completion rates

---

## Summary

| Phase | Milestone | Duration | Priority |
|-------|-----------|----------|----------|
| 1 | Foundation (Backend Core) | 2-3 days | **Required** |
| 2 | Rendering Engine | 2-3 days | **Required** |
| 3 | AI Generation | 3-4 days | **Required** |
| 4 | Frontend Viewer | 3-4 days | **Required** |
| 5 | Generation UI | 2-3 days | **Required** |
| 6 | Session Editor | 3-4 days | Optional |
| 7 | Progress Tracking | 2-3 days | Optional |

**Total MVP**: ~15-20 days of development

**Critical Path**: Milestones 1 → 2 → 3 → 4 → 5 (linear dependency)

---

## Next Steps

1. Review and approve this plan
2. Start Milestone 1: Create gymnasium module and Session entity
3. Seed with k8s-dojo content as test data
4. Build rendering engine to validate template approach
5. Integrate AI generation
6. Build frontend components

Ready to begin implementation on approval.
