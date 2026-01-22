# Classroom Feature Implementation Plan

**Created**: January 20, 2026
**Status**: Planning
**Priority**: P1 - Core Learning Experience

---

## Executive Summary

The **Classroom** is a premium reading experience for learning path content. It transforms raw Knowledge Units into beautifully formatted, "coffee table book" style pages with rich content including code examples, Mermaid diagrams, callout boxes, and real-world analogies.

**Core Philosophy**: Reading is the foundation of learning. Before practicing in the Gymnasium, students absorb material in the Classroom. The experience should feel premium, immersive, and distraction-free.

---

## Table of Contents

1. [Learning Flow](#1-learning-flow)
2. [Data Model](#2-data-model)
3. [Content Generation Pipeline](#3-content-generation-pipeline)
4. [API Design](#4-api-design)
5. [Frontend Architecture](#5-frontend-architecture)
6. [Reading Experience Features](#6-reading-experience-features)
7. [Quiz Integration](#7-quiz-integration)
8. [PDF Export](#8-pdf-export)
9. [File Structure](#9-file-structure)
10. [Milestones](#10-milestones)
11. [Technical Decisions](#11-technical-decisions)

---

## 1. Learning Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CONCEPT LEARNING FLOW                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                │
│   │ Sub-concept │───▶│ Sub-concept │───▶│ Sub-concept │                │
│   │      1      │    │      2      │    │      N      │                │
│   └──────┬──────┘    └──────┬──────┘    └──────┬──────┘                │
│          │                  │                  │                        │
│          ▼                  ▼                  ▼                        │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                │
│   │  📖 READ    │    │  📖 READ    │    │  📖 READ    │                │
│   │ (Classroom) │    │ (Classroom) │    │ (Classroom) │                │
│   └──────┬──────┘    └──────┬──────┘    └──────┬──────┘                │
│          │                  │                  │                        │
│          ▼                  ▼                  ▼                        │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                │
│   │ 📝 MICRO   │    │ 📝 MICRO   │    │ 📝 MICRO   │                │
│   │   QUIZ     │    │   QUIZ     │    │   QUIZ     │                │
│   └─────────────┘    └─────────────┘    └─────────────┘                │
│                                                                         │
│                              │                                          │
│                              ▼                                          │
│                    ┌─────────────────┐                                  │
│                    │  📝 CONCEPT     │                                  │
│                    │     QUIZ        │                                  │
│                    │ (All sub-concepts) │                               │
│                    └────────┬────────┘                                  │
│                             │                                           │
│                             ▼                                           │
│                    ┌─────────────────┐                                  │
│                    │  🏋️ GYMNASIUM   │                                  │
│                    │    SESSION      │                                  │
│                    │ (Hands-on practice) │                              │
│                    └─────────────────┘                                  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### User Journey

1. **Enter Concept** → See table of contents with all sub-concepts
2. **Read Sub-concept** → Scroll through beautifully formatted content
3. **Complete Micro-quiz** → 3-5 questions on just-read material
4. **Repeat** → Continue through all sub-concepts
5. **Concept Quiz** → Cumulative assessment
6. **Gymnasium** → Apply knowledge hands-on

---

## 2. Data Model

### New Entities

```typescript
// Classroom content for a sub-concept
interface ClassroomContent {
  id: string;
  subConceptId: string;
  conceptId: string;        // Denormalized for easier queries
  learningPathId: string;   // Denormalized for easier queries

  // Content structure
  title: string;
  summary: string;          // 2-3 sentence overview
  sections: ClassroomSection[];

  // Metadata
  estimatedReadTime: number; // Minutes
  wordCount: number;
  version: number;

  // Generation tracking
  status: 'pending' | 'generating' | 'ready' | 'error';
  generatedAt: Date | null;
  regeneratedAt: Date | null;
  sourceKuIds: string[];    // KUs used to generate this content

  createdAt: Date;
  updatedAt: Date;
}

interface ClassroomSection {
  id: string;
  order: number;
  type: 'prose' | 'code' | 'diagram' | 'callout' | 'example';

  // Content varies by type
  content: string;          // Markdown for prose
  code?: CodeBlock;
  diagram?: DiagramBlock;
  callout?: CalloutBlock;
}

interface CodeBlock {
  language: string;
  code: string;
  filename?: string;
  highlightLines?: number[];
  caption?: string;
}

interface DiagramBlock {
  type: 'mermaid' | 'ascii';
  source: string;
  caption?: string;
}

interface CalloutBlock {
  type: 'tip' | 'warning' | 'info' | 'example' | 'analogy';
  title?: string;
  content: string;
}
```

### Reading Progress Tracking

```typescript
interface ReadingProgress {
  id: string;
  userId: string;
  classroomContentId: string;
  subConceptId: string;
  conceptId: string;
  learningPathId: string;

  // Progress tracking (Kindle-style)
  status: 'not_started' | 'in_progress' | 'completed';
  scrollPosition: number;       // Percentage 0-100
  lastReadAt: Date | null;
  completedAt: Date | null;

  // Time tracking
  totalReadTime: number;        // Seconds
  sessionCount: number;         // How many reading sessions

  createdAt: Date;
  updatedAt: Date;
}
```

### User Reading Preferences

```typescript
interface ReadingPreferences {
  id: string;
  userId: string;

  // Display preferences
  theme: 'light' | 'dark' | 'sepia';
  fontSize: 'small' | 'medium' | 'large';
  lineSpacing: 'compact' | 'normal' | 'relaxed';
  fontFamily: 'sans' | 'serif' | 'mono';

  createdAt: Date;
  updatedAt: Date;
}
```

### Micro-Quiz

```typescript
interface MicroQuiz {
  id: string;
  subConceptId: string;
  classroomContentId: string;

  questions: MicroQuizQuestion[];
  passingScore: number;         // Percentage required to pass

  status: 'pending' | 'generating' | 'ready';
  generatedAt: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

interface MicroQuizQuestion {
  id: string;
  order: number;
  type: 'multiple_choice' | 'true_false' | 'fill_blank';
  question: string;
  options?: string[];           // For multiple choice
  correctAnswer: string | number;
  explanation: string;          // Shown after answering
  sourceKuId?: string;          // Which KU this tests
}

interface MicroQuizAttempt {
  id: string;
  userId: string;
  microQuizId: string;

  answers: { questionId: string; answer: string | number }[];
  score: number;
  passed: boolean;

  startedAt: Date;
  completedAt: Date;
}
```

### Entity Relationships

```
LearningPath
    └── Concept (1:N)
            ├── SubConcept (1:N)
            │       ├── KnowledgeUnit (1:N)
            │       ├── ClassroomContent (1:1)
            │       ├── MicroQuiz (1:1)
            │       └── ReadingProgress (1:N per user)
            │
            ├── ConceptQuiz (1:1)
            └── GymnasiumSession (1:1)
```

---

## 3. Content Generation Pipeline

### Generation Triggers

```
┌─────────────────────────────────────────────────────────────────┐
│                    GENERATION TRIGGERS                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Learning Path Completion                                    │
│     └── Generate all ClassroomContent + MicroQuizzes            │
│                                                                 │
│  2. Manual Trigger (Admin)                                      │
│     └── Regenerate specific Concept or SubConcept               │
│                                                                 │
│  3. New KU Discovered/Added                                     │
│     └── Regenerate affected SubConcept's ClassroomContent       │
│                                                                 │
│  4. KU Updated                                                  │
│     └── Mark ClassroomContent as stale, queue regeneration      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     CLASSROOM GENERATION PIPELINE                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────┐                                                   │
│  │ TRIGGER EVENT    │                                                   │
│  │ (Path complete,  │                                                   │
│  │  manual, KU add) │                                                   │
│  └────────┬─────────┘                                                   │
│           │                                                             │
│           ▼                                                             │
│  ┌──────────────────┐     ┌─────────────────────────────────────────┐  │
│  │ classroom-       │     │  For each Concept:                      │  │
│  │ generation       │────▶│    For each SubConcept:                 │  │
│  │ (BullMQ Queue)   │     │      1. Gather KUs                      │  │
│  └──────────────────┘     │      2. Generate ClassroomContent       │  │
│                           │      3. Generate MicroQuiz              │  │
│                           │      4. Emit WebSocket update           │  │
│                           │    Generate ConceptQuiz                 │  │
│                           └─────────────────────────────────────────┘  │
│                                          │                              │
│                                          ▼                              │
│                           ┌─────────────────────────────────────────┐  │
│                           │  WebSocket Events:                      │  │
│                           │  - classroom:generating                 │  │
│                           │  - classroom:subconcept:ready           │  │
│                           │  - classroom:concept:ready              │  │
│                           │  - classroom:path:ready                 │  │
│                           └─────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### AI Generation Prompts

#### ClassroomContent Generation

```typescript
const CLASSROOM_CONTENT_PROMPT = `
You are creating educational content for a premium learning platform.
Transform the following Knowledge Units into a beautifully structured lesson.

SUB-CONCEPT: {{subConceptName}}
CONCEPT: {{conceptName}}
LEARNING PATH: {{learningPathName}}

KNOWLEDGE UNITS:
{{knowledgeUnits}}

Generate a comprehensive lesson with the following structure:

1. SUMMARY (2-3 sentences introducing the topic)

2. SECTIONS (create 3-7 sections covering the material):
   Each section should include:
   - Clear prose explanation
   - At least one of: code example, mermaid diagram, or callout
   - Real-world analogy where appropriate

3. Use these callout types:
   - TIP: Practical advice
   - WARNING: Common mistakes to avoid
   - INFO: Additional context
   - EXAMPLE: Concrete examples
   - ANALOGY: Real-world comparisons

4. Code examples should be:
   - Complete and runnable where possible
   - Well-commented
   - Progressively building on each other

5. Mermaid diagrams for:
   - Architecture/flow concepts
   - Relationships between components
   - Process flows

OUTPUT FORMAT: JSON matching ClassroomSection[] schema
`;
```

#### MicroQuiz Generation

```typescript
const MICRO_QUIZ_PROMPT = `
Generate a micro-quiz (3-5 questions) for the following lesson content.

LESSON: {{classroomContent}}

Requirements:
1. Questions should test comprehension, not memorization
2. Mix question types: multiple choice, true/false
3. Each question should have a clear explanation
4. Questions should progress from basic to slightly challenging
5. Reference specific concepts from the lesson

OUTPUT FORMAT: JSON matching MicroQuizQuestion[] schema
`;
```

---

## 4. API Design

### Endpoints

```typescript
// ==================== CLASSROOM CONTENT ====================

// Get classroom content for a sub-concept
GET /api/classroom/sub-concept/:subConceptId
Response: ClassroomContent

// Get all classroom content for a concept (for long-form view)
GET /api/classroom/concept/:conceptId
Response: {
  concept: Concept,
  subConcepts: Array<{
    subConcept: SubConcept,
    classroomContent: ClassroomContent,
    microQuiz: MicroQuiz
  }>
}

// Trigger regeneration
POST /api/classroom/regenerate
Body: {
  type: 'sub-concept' | 'concept' | 'learning-path',
  id: string
}
Response: { jobId: string }

// Get generation status
GET /api/classroom/status/:learningPathId
Response: {
  status: 'pending' | 'generating' | 'ready' | 'partial',
  progress: { completed: number, total: number },
  concepts: Array<{
    conceptId: string,
    status: string,
    subConcepts: Array<{ subConceptId: string, status: string }>
  }>
}

// ==================== READING PROGRESS ====================

// Get reading progress for a concept
GET /api/classroom/progress/concept/:conceptId
Response: {
  conceptId: string,
  overallProgress: number,
  subConcepts: Array<{
    subConceptId: string,
    progress: ReadingProgress
  }>
}

// Update reading progress
PATCH /api/classroom/progress/:classroomContentId
Body: {
  scrollPosition: number,
  readTime?: number  // Seconds spent in this session
}
Response: ReadingProgress

// Mark as complete
POST /api/classroom/progress/:classroomContentId/complete
Response: ReadingProgress

// ==================== READING PREFERENCES ====================

// Get user reading preferences
GET /api/classroom/preferences
Response: ReadingPreferences

// Update reading preferences
PATCH /api/classroom/preferences
Body: Partial<ReadingPreferences>
Response: ReadingPreferences

// ==================== MICRO QUIZ ====================

// Get micro quiz
GET /api/classroom/quiz/micro/:subConceptId
Response: MicroQuiz (questions without answers)

// Submit micro quiz
POST /api/classroom/quiz/micro/:microQuizId/submit
Body: { answers: Array<{ questionId: string, answer: string | number }> }
Response: {
  score: number,
  passed: boolean,
  results: Array<{
    questionId: string,
    correct: boolean,
    correctAnswer: string | number,
    explanation: string
  }>
}

// ==================== PDF EXPORT ====================

// Generate PDF for a concept
POST /api/classroom/export/pdf/concept/:conceptId
Response: { jobId: string }

// Get PDF download
GET /api/classroom/export/pdf/:jobId
Response: PDF file stream

// Get PDF status
GET /api/classroom/export/pdf/:jobId/status
Response: { status: 'generating' | 'ready' | 'error', downloadUrl?: string }
```

---

## 5. Frontend Architecture

### Component Structure

```
libs/feature-classroom/
├── src/
│   ├── lib/
│   │   ├── classroom.component.ts          # Main container
│   │   ├── classroom.component.html
│   │   ├── classroom.component.scss
│   │   │
│   │   ├── components/
│   │   │   ├── table-of-contents/          # TOC sidebar
│   │   │   ├── reading-view/               # Main reading area
│   │   │   ├── section-renderer/           # Renders different section types
│   │   │   ├── code-block/                 # Syntax-highlighted code
│   │   │   ├── diagram-block/              # Mermaid renderer
│   │   │   ├── callout-block/              # Tips, warnings, etc.
│   │   │   ├── progress-bar/               # Reading progress indicator
│   │   │   ├── reading-controls/           # Font size, theme toggles
│   │   │   └── micro-quiz/                 # Inline quiz component
│   │   │
│   │   ├── services/
│   │   │   ├── classroom.service.ts        # API calls
│   │   │   ├── reading-progress.service.ts # Progress tracking
│   │   │   └── reading-preferences.service.ts
│   │   │
│   │   └── styles/
│   │       ├── _typography.scss            # Book-like typography
│   │       ├── _themes.scss                # Light/dark/sepia
│   │       └── _print.scss                 # PDF/print styles
│   │
│   └── index.ts
```

### Reading View Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ← Back to Learning Path    │    Concept: Kubernetes Networking         │
├─────────────────────────────────────────────────────────────────────────┤
│                             │                                           │
│  TABLE OF CONTENTS          │   ┌─────────────────────────────────┐    │
│  ─────────────────          │   │  [Reading Controls Bar]          │    │
│                             │   │  🌙/☀️  Aa+/-  ≡ Export PDF      │    │
│  ○ Overview                 │   └─────────────────────────────────┘    │
│  ● Services & Discovery ◄── │                                           │
│    └─ 45% read              │   ════════════════════════════════════   │
│  ○ Ingress & Load Balancing │              SERVICES & DISCOVERY         │
│  ○ Network Policies         │   ════════════════════════════════════   │
│                             │                                           │
│  ─────────────────          │   Kubernetes Services provide a stable    │
│  Progress: 2/4 sections     │   networking endpoint for a set of Pods.  │
│  ▓▓▓▓▓▓▓▓░░░░░░░░ 45%      │   Think of a Service like a phone number  │
│                             │   that never changes, even when the       │
│                             │   people answering it rotate shifts...    │
│                             │                                           │
│                             │   ┌─────────────────────────────────┐    │
│                             │   │ 💡 TIP                          │    │
│                             │   │ Always use Services instead of  │    │
│                             │   │ direct Pod IPs in production.   │    │
│                             │   └─────────────────────────────────┘    │
│                             │                                           │
│                             │   ```yaml                                 │
│                             │   apiVersion: v1                          │
│                             │   kind: Service                           │
│                             │   metadata:                               │
│                             │     name: my-service                      │
│                             │   spec:                                   │
│                             │     selector:                             │
│                             │       app: my-app                         │
│                             │   ```                                     │
│                             │                                           │
│                             │   ```mermaid                              │
│                             │   graph LR                                │
│                             │     Client --> Service                    │
│                             │     Service --> Pod1                      │
│                             │     Service --> Pod2                      │
│                             │   ```                                     │
│                             │                                           │
│                             │   ─────────────────────────────────────   │
│                             │                                           │
│                             │   [Continue to Next Section →]            │
│                             │                                           │
│                             │   ─────────────────────────────────────   │
│                             │                                           │
│                             │   📝 QUICK CHECK                          │
│                             │   ┌─────────────────────────────────┐    │
│                             │   │ Q1: What problem do Services    │    │
│                             │   │     solve in Kubernetes?        │    │
│                             │   │                                 │    │
│                             │   │ ○ A) Pod IP instability         │    │
│                             │   │ ○ B) Storage management         │    │
│                             │   │ ○ C) CPU allocation             │    │
│                             │   └─────────────────────────────────┘    │
│                             │                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

### Theme Styles

```scss
// Light theme (default)
.theme-light {
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --text-primary: #1a1a2e;
  --text-secondary: #4a4a5a;
  --accent: #2563eb;
  --border: #e5e7eb;
}

// Dark theme
.theme-dark {
  --bg-primary: #0f0f0f;
  --bg-secondary: #1a1a1a;
  --text-primary: #e5e5e5;
  --text-secondary: #a0a0a0;
  --accent: #60a5fa;
  --border: #2a2a2a;
}

// Sepia theme (easy on eyes)
.theme-sepia {
  --bg-primary: #f4ecd8;
  --bg-secondary: #ebe3d0;
  --text-primary: #3d3427;
  --text-secondary: #5c5346;
  --accent: #8b4513;
  --border: #d4c9b5;
}

// Font sizes
.font-small { --font-size-base: 14px; --line-height: 1.6; }
.font-medium { --font-size-base: 16px; --line-height: 1.7; }
.font-large { --font-size-base: 18px; --line-height: 1.8; }
```

---

## 6. Reading Experience Features

### Progress Tracking (Kindle-style)

```typescript
// Track scroll position
@HostListener('scroll', ['$event'])
onScroll(event: Event) {
  const element = event.target as HTMLElement;
  const scrollPercentage = (element.scrollTop / (element.scrollHeight - element.clientHeight)) * 100;

  // Debounce and save to backend
  this.progressService.updatePosition(this.contentId, scrollPercentage);
}

// Track time spent
ngOnInit() {
  this.sessionStartTime = Date.now();
}

ngOnDestroy() {
  const sessionTime = (Date.now() - this.sessionStartTime) / 1000;
  this.progressService.addReadTime(this.contentId, sessionTime);
}
```

### Reading Controls

- **Theme toggle**: Light / Dark / Sepia
- **Font size**: Small / Medium / Large
- **Progress indicator**: "45% complete • 8 min remaining"
- **Export**: Download as PDF button

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `j` / `↓` | Scroll down |
| `k` / `↑` | Scroll up |
| `n` | Next section |
| `p` | Previous section |
| `t` | Toggle table of contents |
| `d` | Toggle dark mode |

---

## 7. Quiz Integration

### Micro-Quiz Flow

```
┌─────────────────────────────────────────┐
│         END OF SUB-CONCEPT              │
├─────────────────────────────────────────┤
│                                         │
│  📝 Quick Check                         │
│  ─────────────                          │
│  Test your understanding before         │
│  moving on.                             │
│                                         │
│  Question 1 of 3                        │
│  ┌─────────────────────────────────┐   │
│  │ What is the primary purpose of  │   │
│  │ a Kubernetes Service?           │   │
│  │                                 │   │
│  │ ○ Scale pods automatically      │   │
│  │ ○ Provide stable networking     │   │
│  │ ○ Manage storage volumes        │   │
│  │ ○ Configure security policies   │   │
│  └─────────────────────────────────┘   │
│                                         │
│        [Check Answer]                   │
│                                         │
└─────────────────────────────────────────┘

                    │
                    ▼ (after answering)

┌─────────────────────────────────────────┐
│  ✅ Correct!                            │
│                                         │
│  Services provide a stable IP address   │
│  and DNS name for accessing pods,       │
│  decoupling clients from pod lifecycle. │
│                                         │
│        [Next Question →]                │
└─────────────────────────────────────────┘
```

### Concept Quiz

- Separate full-page view
- 10-15 questions covering all sub-concepts
- Timed option (optional)
- Detailed results with per-sub-concept breakdown
- Retry option with new questions

---

## 8. PDF Export

### PDF Structure

```
┌─────────────────────────────────────────┐
│                                         │
│         KUBERNETES NETWORKING           │
│         ═══════════════════            │
│                                         │
│         A Kasita Learning Module        │
│                                         │
│         Learning Path: Kubernetes       │
│         Generated: January 20, 2026     │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  TABLE OF CONTENTS                      │
│                                         │
│  1. Services & Discovery ........... 3  │
│  2. Ingress & Load Balancing ...... 12  │
│  3. Network Policies .............. 21  │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  [Beautifully formatted content         │
│   with proper page breaks,              │
│   syntax-highlighted code,              │
│   rendered diagrams,                    │
│   styled callouts]                      │
│                                         │
└─────────────────────────────────────────┘
```

### PDF Generation Pipeline

```typescript
// Use Puppeteer or similar for PDF generation
async generatePDF(conceptId: string): Promise<Buffer> {
  // 1. Fetch all classroom content for concept
  const content = await this.getConceptContent(conceptId);

  // 2. Render to HTML with print styles
  const html = await this.renderToPrintHTML(content);

  // 3. Generate PDF via headless browser
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html);

  const pdf = await page.pdf({
    format: 'A4',
    margin: { top: '1in', bottom: '1in', left: '1in', right: '1in' },
    printBackground: true,
  });

  await browser.close();
  return pdf;
}
```

---

## 9. File Structure

### Backend

```
apps/api/src/
├── classroom/
│   ├── classroom.module.ts
│   ├── classroom.controller.ts
│   ├── classroom.service.ts
│   ├── classroom-generation.service.ts
│   │
│   ├── dto/
│   │   ├── classroom-content.dto.ts
│   │   ├── reading-progress.dto.ts
│   │   ├── micro-quiz.dto.ts
│   │   └── export.dto.ts
│   │
│   ├── entities/
│   │   ├── classroom-content.entity.ts
│   │   ├── reading-progress.entity.ts
│   │   ├── reading-preferences.entity.ts
│   │   ├── micro-quiz.entity.ts
│   │   └── micro-quiz-attempt.entity.ts
│   │
│   ├── generation/
│   │   ├── classroom-generation.processor.ts
│   │   ├── content-generator.ts
│   │   └── quiz-generator.ts
│   │
│   └── export/
│       ├── pdf-export.processor.ts
│       └── pdf-renderer.ts
```

### Frontend

```
libs/feature-classroom/
├── src/
│   ├── lib/
│   │   ├── classroom.component.ts
│   │   ├── classroom.component.html
│   │   ├── classroom.component.scss
│   │   │
│   │   ├── pages/
│   │   │   ├── concept-reader/         # Main reading view
│   │   │   └── concept-quiz/           # Concept quiz view
│   │   │
│   │   ├── components/
│   │   │   ├── table-of-contents/
│   │   │   ├── reading-view/
│   │   │   ├── section-prose/
│   │   │   ├── section-code/
│   │   │   ├── section-diagram/
│   │   │   ├── section-callout/
│   │   │   ├── progress-bar/
│   │   │   ├── reading-controls/
│   │   │   ├── micro-quiz/
│   │   │   └── quiz-question/
│   │   │
│   │   ├── services/
│   │   │   ├── classroom-api.service.ts
│   │   │   ├── reading-progress.service.ts
│   │   │   └── reading-preferences.service.ts
│   │   │
│   │   └── styles/
│   │       ├── _typography.scss
│   │       ├── _themes.scss
│   │       ├── _code.scss
│   │       ├── _callouts.scss
│   │       └── _print.scss
│   │
│   └── index.ts
```

---

## 10. Milestones

### Phase 1: Foundation (Week 1-2)

**Goal**: Basic classroom content generation and display

- [ ] Create database entities (ClassroomContent, ReadingProgress)
- [ ] Create ClassroomContent generation service
- [ ] Create BullMQ job for classroom generation
- [ ] Hook into learning path completion pipeline
- [ ] Create basic classroom API endpoints
- [ ] Create Angular library scaffold
- [ ] Create basic reading view component
- [ ] Render prose, code blocks, and diagrams

**Deliverable**: Can generate and view classroom content for a concept

### Phase 2: Reading Experience (Week 2-3)

**Goal**: Premium reading experience with progress tracking

- [ ] Implement theme switching (light/dark/sepia)
- [ ] Implement font size controls
- [ ] Implement scroll position tracking
- [ ] Implement read time tracking
- [ ] Create table of contents component
- [ ] Add keyboard navigation
- [ ] Add "estimated read time" display
- [ ] Create callout block styles

**Deliverable**: Kindle-like reading experience with progress persistence

### Phase 3: Micro-Quizzes (Week 3-4)

**Goal**: Inline knowledge checks

- [ ] Create MicroQuiz entity and generation
- [ ] Create quiz question components
- [ ] Implement quiz submission and grading
- [ ] Show explanations after answers
- [ ] Track quiz attempts
- [ ] Display quiz at end of each sub-concept

**Deliverable**: Micro-quizzes work inline after each sub-concept

### Phase 4: Concept Quiz (Week 4)

**Goal**: Cumulative assessment

- [ ] Create ConceptQuiz generation (reuse question generator)
- [ ] Create dedicated concept quiz page
- [ ] Implement timed quiz option
- [ ] Show detailed results breakdown
- [ ] Track concept mastery

**Deliverable**: Concept quizzes assess cumulative knowledge

### Phase 5: PDF Export (Week 5)

**Goal**: Beautiful PDF export

- [ ] Set up Puppeteer for PDF generation
- [ ] Create print-optimized CSS
- [ ] Create PDF generation BullMQ job
- [ ] Implement download endpoint
- [ ] Add cover page and TOC

**Deliverable**: Can export any concept as a beautiful PDF

### Phase 6: Polish & Integration (Week 6)

**Goal**: Production ready

- [ ] WebSocket integration for generation progress
- [ ] Regeneration triggers (KU added/updated)
- [ ] Mobile responsive design
- [ ] Error handling and edge cases
- [ ] Performance optimization
- [ ] Integration with learning path navigation

**Deliverable**: Feature complete and production ready

---

## 11. Technical Decisions

### Content Storage

**Decision**: Store generated content as JSON in PostgreSQL
**Rationale**:
- Flexible schema for varying section types
- Easy to query and update
- No additional infrastructure needed

### PDF Generation

**Decision**: Puppeteer with headless Chrome
**Rationale**:
- Best CSS/layout support
- Handles Mermaid diagrams well
- Consistent cross-platform output

### Mermaid Rendering

**Decision**: Client-side rendering with mermaid.js
**Rationale**:
- Interactive in browser
- Pre-render to SVG for PDF export

### Quiz Question Generation

**Decision**: Generate alongside classroom content
**Rationale**:
- Questions are contextual to the content
- Can reference specific sections
- Generated once, not on-demand

### Progress Tracking

**Decision**: Debounced updates with optimistic UI
**Rationale**:
- Don't spam backend on every scroll
- Persist every 5 seconds or on page leave
- Show progress immediately in UI

---

## Appendix: Sample Generated Content

### Input (Knowledge Units)

```json
[
  {
    "id": "ku-1",
    "title": "Kubernetes Service Types",
    "content": "ClusterIP, NodePort, LoadBalancer, and ExternalName are the four service types..."
  },
  {
    "id": "ku-2",
    "title": "Service Discovery",
    "content": "Kubernetes provides DNS-based service discovery through CoreDNS..."
  }
]
```

### Output (ClassroomContent)

```json
{
  "id": "cc-1",
  "subConceptId": "sc-1",
  "title": "Services & Discovery",
  "summary": "Learn how Kubernetes Services provide stable networking endpoints and enable service discovery across your cluster.",
  "estimatedReadTime": 12,
  "sections": [
    {
      "id": "sec-1",
      "order": 1,
      "type": "prose",
      "content": "## The Pod IP Problem\n\nIn Kubernetes, Pods are ephemeral. They can be created, destroyed, and rescheduled at any moment. Each time a Pod starts, it gets a new IP address. This creates a fundamental challenge: how do you reliably connect to something that keeps moving?\n\n**Services solve this problem.**"
    },
    {
      "id": "sec-2",
      "order": 2,
      "type": "callout",
      "callout": {
        "type": "analogy",
        "title": "Think of it like a call center",
        "content": "Imagine calling a company's support line. You dial one number, but different agents answer each time. The phone number (Service) stays constant, even though the people answering (Pods) change. Kubernetes Services work the same way."
      }
    },
    {
      "id": "sec-3",
      "order": 3,
      "type": "diagram",
      "diagram": {
        "type": "mermaid",
        "source": "graph LR\n    Client[Client] --> SVC[Service<br/>10.0.0.1]\n    SVC --> Pod1[Pod A<br/>10.1.0.5]\n    SVC --> Pod2[Pod B<br/>10.1.0.6]\n    SVC --> Pod3[Pod C<br/>10.1.0.7]",
        "caption": "A Service provides a stable IP that routes to multiple Pods"
      }
    },
    {
      "id": "sec-4",
      "order": 4,
      "type": "prose",
      "content": "## Service Types\n\nKubernetes offers four types of Services, each suited for different use cases:"
    },
    {
      "id": "sec-5",
      "order": 5,
      "type": "code",
      "code": {
        "language": "yaml",
        "filename": "clusterip-service.yaml",
        "code": "apiVersion: v1\nkind: Service\nmetadata:\n  name: my-service\nspec:\n  type: ClusterIP  # Default type\n  selector:\n    app: my-app\n  ports:\n    - port: 80\n      targetPort: 8080",
        "caption": "A basic ClusterIP Service - only accessible within the cluster"
      }
    },
    {
      "id": "sec-6",
      "order": 6,
      "type": "callout",
      "callout": {
        "type": "tip",
        "content": "Start with ClusterIP for internal services. Only expose externally when necessary using NodePort or LoadBalancer."
      }
    }
  ]
}
```

---

*This plan will be updated as implementation progresses.*
