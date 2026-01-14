# KASITA MVP User Stories & Acceptance Criteria

**Version 1.0 | January 2026**

---

## Executive Summary

Kasita is a knowledge acquisition platform that transforms how people learn complex skills. Unlike traditional learning platforms that deliver content linearly, Kasita uses AI to generate personalized learning maps, synthesize content from multiple sources into structured knowledge units, and adapt to individual learning preferences through continuous feedback loops.

This document defines the user stories and acceptance criteria for a functional MVP that facilitates a complete learning cycle: from stating a learning objective to demonstrating measurable competence.

### Core Value Proposition

- **Parallel content ingestion** from N sources simultaneously (vs. linear book-by-book reading)
- **Principle extraction**: surface common themes and core concepts, eliminating ~80% of fluffy content
- **Cross-referencing**: AI identifies patterns across sources that human memory would miss
- **Dynamic calibration**: content presentation adapts to cognitive load, modality preferences, and existing mental models
- **Performance validation**: measurable proof of capability through challenges, projects, and feedback

---

## System Architecture Overview

Kasita uses an audio engineering metaphor for its architecture, emphasizing signal flow and modularity:

### Patchbay (Python)
Input adapters that normalize diverse sources (newsletters, podcasts, videos, articles, PDFs) into a common format. Each adapter is like a cable/jack converting different formats into standardized signals.

### Synthesizer (Python)
Processing layer that transforms raw content through embeddings, clustering, and LLM generation to create learning artifacts: knowledge units, flashcards, challenges, and projects.

### Console (Angular)
Control center for managing learning paths, configuring sources, reviewing generated content, and monitoring progress.

### Learning Apps (Angular)
Specialized applications for different phases of learning: Infiltrate (flashcards), Quiz Runner, Challenge Arena, and future Arcade experiences.

### Nest.js API
RESTful API that orchestrates all components, manages data persistence, and coordinates feedback between AI, mentors, and learners.

---

## Epic 1: Learning Objective & Map Generation

> As a learner, I want to state a learning objective in natural language and receive a structured learning map of key principles I need to master to achieve that outcome.

### User Stories

| ID | User Story | Priority | Component |
|----|------------|----------|-----------|
| LM-01 | As a learner, I can create a new learning path by entering a natural language objective (e.g., "I want to learn how to build apps with AI") | Must Have | Console |
| LM-02 | As a learner, I receive an AI-generated learning map showing the key principles, concepts, and skills required to achieve my objective | Must Have | Synthesizer |
| LM-03 | As a learner, I can view the generated learning map as a visual hierarchy showing dependencies between concepts | Should Have | Console |
| LM-04 | As a learner, I can edit, add, or remove principles from the generated learning map before proceeding | Must Have | Console |
| LM-05 | As a learner, I can set a target timeline for my learning path (e.g., "master in 4 weeks") | Should Have | Console |
| LM-06 | As a learner, I can indicate my current skill level so the learning map adjusts its starting point | Should Have | Console |
| LM-07 | As a learner, I can save and revisit multiple learning paths | Must Have | API |

### Acceptance Criteria for LM-01 & LM-02

| AC# | Acceptance Criteria |
|-----|---------------------|
| AC1 | Given a learning objective input, when the user submits, then the system calls the Synthesizer to generate a learning map within 30 seconds |
| AC2 | Given an objective like "build apps with AI," the learning map includes at least 8-15 core principles organized hierarchically |
| AC3 | Each principle in the map includes: name, brief description, estimated time to master, and prerequisite principles |
| AC4 | The learning map identifies which principles are foundational vs. advanced |
| AC5 | The system indicates confidence level for the generated map (based on available training data for the domain) |

---

## Epic 2: Content Sourcing & Ingestion

> As a learner, I want Kasita to source relevant content to flesh out the principles in my learning map, ingesting from multiple channels simultaneously.

### User Stories

| ID | User Story | Priority | Component |
|----|------------|----------|-----------|
| CS-01 | As a learner, I can configure source channels: RSS feeds, article URLs, YouTube videos, podcasts, PDFs | Must Have | Console |
| CS-02 | As a learner, I can let AI suggest relevant sources based on my learning map principles | Should Have | Synthesizer |
| CS-03 | As a learner, I can manually add specific URLs or upload documents to supplement auto-sourced content | Must Have | Console |
| CS-04 | As a learner, I can trigger content ingestion and see real-time progress (e.g., "15/20 sources processed") | Must Have | Patchbay |
| CS-05 | As a learner, I can view raw ingested content before synthesis to verify quality | Should Have | Console |
| CS-06 | As a learner, I can exclude specific sources or content that I deem irrelevant or low-quality | Should Have | Console |
| CS-07 | As a learner, I can see which sources were used for each principle in my learning map | Must Have | Console |

### Patchbay Adapters Required

- **Newsletter/RSS Adapter**: feedparser, HTML extraction
- **Article Adapter**: trafilatura, Playwright for JS-rendered pages
- **Video Adapter**: YouTube transcript API, Vimeo support
- **Podcast Adapter**: Audio transcription integration
- **PDF Adapter**: Research paper extraction with citation handling

### Acceptance Criteria for CS-01 & CS-04

| AC# | Acceptance Criteria |
|-----|---------------------|
| AC1 | Patchbay successfully ingests content from at least 3 adapter types: RSS, Article, PDF |
| AC2 | Ingestion of 20 sources completes in under 10 minutes |
| AC3 | Progress updates appear in real-time in the Console UI |
| AC4 | Failed sources are logged with error reasons and can be retried |
| AC5 | Raw content is stored in normalized JSON format with source metadata (title, author, date, URL) |

---

## Epic 3: Content Synthesis & Knowledge Units

> As a learner, I want ingested content synthesized into structured knowledge units that can be assembled into various learning materials.

### User Stories

| ID | User Story | Priority | Component |
|----|------------|----------|-----------|
| SY-01 | As a learner, I can trigger synthesis to transform raw content into knowledge units mapped to my learning map principles | Must Have | Synthesizer |
| SY-02 | As a learner, I receive knowledge units that extract core concepts, eliminating redundant or fluffy content | Must Have | Synthesizer |
| SY-03 | As a learner, I can see cross-references between knowledge units (e.g., "this concept appears in 7/10 sources") | Should Have | Synthesizer |
| SY-04 | As a learner, I can review and approve/reject generated knowledge units before they enter my learning flow | Must Have | Console |
| SY-05 | As a learner, I can edit knowledge unit content to improve clarity or add personal context | Should Have | Console |
| SY-06 | As a learner, I receive knowledge units tagged by difficulty level: foundational, intermediate, advanced | Should Have | Synthesizer |
| SY-07 | As a learner, I can see estimated mastery time for each knowledge unit | Should Have | Synthesizer |

### Knowledge Unit Structure

Each knowledge unit contains:

- **Concept**: Core idea or principle being taught
- **Explanation**: Clear, concise description (principle-focused, not detail-heavy)
- **Examples**: 2-3 concrete examples illustrating the concept
- **Analogies**: Bridges to existing mental models (personalized over time)
- **Questions**: Flashcard Q&A pairs for memorization phase
- **Challenges**: Practice prompts for performance phase
- **Sources**: Citations to original content

### Acceptance Criteria for SY-01 & SY-02

| AC# | Acceptance Criteria |
|-----|---------------------|
| AC1 | Synthesis of 20 raw content items produces 15-40 knowledge units within 5 minutes |
| AC2 | Each knowledge unit contains all required fields: concept, explanation, examples, questions |
| AC3 | Knowledge units are mapped to specific principles in the learning map |
| AC4 | Duplicate concepts from multiple sources are merged into single consolidated units |
| AC5 | Source citations are preserved and accessible from each knowledge unit |

---

## Epic 4: Adaptive Content Presentation

> As a learner, I want content presented in different formats based on my learning preferences and opportunities for novelty to maintain engagement.

### User Stories

| ID | User Story | Priority | Component |
|----|------------|----------|-----------|
| AP-01 | As a learner, I can set my preferred learning modalities: visual, auditory, kinesthetic, reading/writing | Must Have | Console |
| AP-02 | As a learner, I receive content adapted to my preferred modalities (e.g., more diagrams for visual learners) | Must Have | Learning Apps |
| AP-03 | As a learner, I experience varied presentation formats to prevent habituation: flashcards, quizzes, challenges, projects | Should Have | Learning Apps |
| AP-04 | As a learner, the system observes which formats correlate with my best retention and adjusts recommendations | Should Have | API |
| AP-05 | As a learner, I can manually switch between presentation formats at any time | Must Have | Learning Apps |
| AP-06 | As a learner, I receive explanations using analogies matched to my existing knowledge domains | Should Have | Synthesizer |
| AP-07 | As a learner, the system adjusts cognitive load (concepts per session) based on my demonstrated capacity | Should Have | API |

### Presentation Formats (MVP)

- **Flashcards (Infiltrate)**: Spaced repetition for memorization phase
- **Quizzes**: Multiple choice and fill-in-the-blank for knowledge validation
- **Challenges**: Open-ended prompts requiring explanation or demonstration
- **Projects**: X in Y time format (e.g., "5 mini-apps in 5 days")

### Future: Arcade (Post-MVP)

Novel presentation experiences for concept introduction: gamified simulations, interactive visualizations, and competitive learning modes.

### Acceptance Criteria for AP-01 & AP-02

| AC# | Acceptance Criteria |
|-----|---------------------|
| AC1 | User can select 1-4 modality preferences during onboarding or in settings |
| AC2 | Content presentation changes based on selected modalities (e.g., visual mode includes more diagrams) |
| AC3 | System tracks time-to-mastery by modality and surfaces insights to the user |
| AC4 | User can override modality recommendations for any specific knowledge unit |

---

## Epic 5: Feedback Loops

> As a learner, I want feedback from AI, mentors, or both to accelerate my progress and validate my understanding.

### User Stories

| ID | User Story | Priority | Component |
|----|------------|----------|-----------|
| FB-01 | As a learner, I receive immediate AI feedback on flashcard responses (correct/incorrect with explanation) | Must Have | Learning Apps |
| FB-02 | As a learner, I receive AI-generated feedback on challenge submissions with specific improvement suggestions | Must Have | Synthesizer |
| FB-03 | As a learner, I can submit project work for AI evaluation against defined success criteria | Must Have | API |
| FB-04 | As a learner, I can request human mentor review for specific submissions | Should Have | Console |
| FB-05 | As a mentor, I can review learner submissions and provide structured feedback | Should Have | Console |
| FB-06 | As a learner, I can see all feedback history for any knowledge unit or submission | Should Have | Console |
| FB-07 | As a learner, the system identifies recurring gaps in my understanding and suggests targeted review | Should Have | API |
| FB-08 | As a learner, I can rate feedback quality to improve future AI responses | Could Have | Console |

### Feedback Types

- **Immediate**: Flashcard correct/incorrect with brief explanation
- **Evaluative**: Score + rubric breakdown for challenges and projects
- **Developmental**: Specific suggestions for improvement with examples
- **Comparative**: How this attempt compares to previous attempts or benchmarks

### Acceptance Criteria for FB-02 & FB-03

| AC# | Acceptance Criteria |
|-----|---------------------|
| AC1 | AI feedback is generated within 30 seconds of submission |
| AC2 | Feedback includes: overall score, rubric breakdown, 2-3 specific improvement suggestions |
| AC3 | For code submissions: automated checks (compiles, tests pass) plus AI quality review |
| AC4 | Feedback references specific parts of the submission, not generic comments |
| AC5 | User can request clarification on any feedback point |

---

## Epic 6: Progress Tracking & Validation

> As a learner, I want to track my progress through the learning map and validate my competence through measurable demonstrations.

### User Stories

| ID | User Story | Priority | Component |
|----|------------|----------|-----------|
| PT-01 | As a learner, I can see my mastery level for each principle in my learning map | Must Have | Console |
| PT-02 | As a learner, I can see overall progress toward my learning objective as a percentage | Must Have | Console |
| PT-03 | As a learner, I receive spaced repetition scheduling for knowledge units requiring review | Must Have | API |
| PT-04 | As a learner, I can complete capstone projects that demonstrate integrated mastery | Must Have | Learning Apps |
| PT-05 | As a learner, I can generate a portfolio of completed challenges and projects | Should Have | Console |
| PT-06 | As a learner, I can see time invested vs. time remaining based on my pace | Should Have | Console |
| PT-07 | As a learner, I can compare my learning velocity to benchmarks | Could Have | Console |
| PT-08 | As a learner, I receive a completion certificate with demonstrated competencies | Could Have | Console |

### Mastery Phases (Infiltrate Methodology)

1. **Phase 1 - Memorize**: Flashcard mastery using SM-2 spaced repetition
2. **Phase 2 - Recite**: Verbal explanation without notes (recorded and evaluated)
3. **Phase 3 - Perform**: Build something that demonstrates the concept
4. **Phase 4 - Transfer**: Teach or explain to others (stretch goal)

### Acceptance Criteria for PT-01 & PT-04

| AC# | Acceptance Criteria |
|-----|---------------------|
| AC1 | Mastery level displayed as percentage (0-100%) per principle and per knowledge unit |
| AC2 | Mastery calculation considers: flashcard accuracy, challenge scores, project evaluations |
| AC3 | Spaced repetition algorithm (SM-2) schedules reviews based on individual performance |
| AC4 | Capstone projects are generated based on learning map scope and available time |
| AC5 | Portfolio exports include: project descriptions, evaluation scores, evidence links |

---

## Epic 7: Input/Output Optionality

> As a platform, Kasita maximizes optionality for both content inputs and learning outputs to support diverse learning paths and use cases.

### Input Optionality

| ID | User Story | Priority | Component |
|----|------------|----------|-----------|
| IO-01 | As a developer, I can add new Patchbay adapters to support additional content sources | Must Have | Patchbay |
| IO-02 | As a learner, I can import existing learning materials (Anki decks, Notion exports, etc.) | Could Have | Patchbay |
| IO-03 | As a learner, I can capture content via browser extension as I browse | Could Have | Extension |
| IO-04 | As a learner, I can add content from conversations (Slack, Discord, meeting transcripts) | Could Have | Patchbay |

### Output Optionality

| ID | User Story | Priority | Component |
|----|------------|----------|-----------|
| IO-05 | As a developer, I can add new Learning App types to support additional presentation formats | Must Have | Apps |
| IO-06 | As a learner, I can export knowledge units to Anki, Quizlet, or other flashcard apps | Could Have | Console |
| IO-07 | As a learner, I can generate printable study materials from my learning path | Could Have | Console |
| IO-08 | As a learner, I can share learning paths and knowledge units with others | Could Have | Console |

### Architecture Acceptance Criteria

| AC# | Acceptance Criteria |
|-----|---------------------|
| AC1 | Patchbay uses adapter pattern: adding new sources requires only implementing adapter interface |
| AC2 | Learning Apps consume knowledge units via standardized API: new apps can be built without modifying core |
| AC3 | Knowledge unit schema is stable and versioned: changes don't break existing content |
| AC4 | All components communicate via API: no direct database access from Python apps |

---

## Non-Functional Requirements

### Performance

- Learning map generation: < 30 seconds
- Content ingestion (20 sources): < 10 minutes
- Synthesis (20 raw items): < 5 minutes
- Feedback generation: < 30 seconds
- UI response time: < 200ms for standard operations

### Scalability

- Support 100+ concurrent users in MVP
- Learning paths can contain up to 50 principles
- Each principle can have up to 20 knowledge units
- Users can maintain up to 10 active learning paths

### Reliability

- 99% uptime for API and web applications
- Failed ingestion or synthesis can be retried without data loss
- User progress is persisted immediately (no data loss on session end)

### Security

- User authentication via email/password (JWT tokens)
- Learning paths and progress are private by default
- API keys for external services stored securely (not in code)

---

## MVP Success Criteria

### Quantitative

- User completes full learning cycle (objective → validated competence) in ≤ 20 hours
- 15 sources → 30 knowledge units processed in < 30 minutes total
- 80%+ mastery achieved on flashcards with ≤ 15 hours of practice
- 10x time efficiency vs. traditional linear learning (self-reported)

### Qualitative

- User reports: "I feel confident discussing this topic now"
- User demonstrates: Can explain concepts without notes
- User validates: Passes realistic performance test (mock interview, whiteboard, etc.)
- User creates 2nd learning path immediately after completing first

### Platform Validation

- Workflow completes end-to-end without manual intervention (except content review)
- Workflow generalizes to at least 3 different domains (e.g., AI/ML, Kubernetes, Golf)
- Users refer others: "You have to try this"

---

## Explicitly Out of Scope for MVP

### Features Deferred to Post-MVP

- Arcade: Novel gamified experiences for concept introduction
- Video analysis / motion capture for physical skills
- Real-time collaboration between learners
- Mobile native applications (web responsive only for MVP)
- Social features: sharing, leaderboards, achievements
- Advanced analytics dashboard
- Marketplace for learning paths
- Payment / monetization features
- Multi-language support
- Offline mode

### Technical Scope Boundaries

- Patchbay: 3-5 adapter types only (RSS, Article, PDF, YouTube, manual upload)
- Learning Apps: Infiltrate (flashcards), basic Quiz, Challenge submission only
- Feedback: AI-generated only (mentor features are stretch goal)
- Calibration: Basic difficulty scaling only (advanced personalization post-MVP)

---

## Appendix: MVP Data Model Summary

### Core Entities

- **LearningPath**: User's learning objective, timeline, and configuration
- **Principle**: Key concept in the learning map (generated by AI, editable by user)
- **SourceConfig**: Configuration for content sources (RSS URL, article list, etc.)
- **RawContent**: Normalized content from Patchbay (before synthesis)
- **KnowledgeUnit**: Synthesized learning unit with concept, examples, questions
- **UserProgress**: Per-unit mastery tracking with spaced repetition data
- **Submission**: User's challenge or project submission
- **Feedback**: AI or mentor feedback on submissions

### Key Relationships

```
LearningPath (1) ──────< (N) Principle
                              │
                              │ (1)
                              ▼
                         (N) KnowledgeUnit >────── (N) RawContent
                              │
                              │ (1)
                              ▼
                         (N) UserProgress
                              
KnowledgeUnit (1) ──────< (N) Submission (1) ──────< (1) Feedback
```

### Entity Details

```typescript
interface LearningPath {
  id: string;
  userId: string;
  objective: string;           // Natural language learning goal
  targetDate?: Date;           // Optional deadline
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  status: 'draft' | 'active' | 'completed' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

interface Principle {
  id: string;
  learningPathId: string;
  name: string;
  description: string;
  estimatedHours: number;
  difficulty: 'foundational' | 'intermediate' | 'advanced';
  prerequisites: string[];     // IDs of prerequisite principles
  order: number;
  status: 'pending' | 'in_progress' | 'mastered';
}

interface KnowledgeUnit {
  id: string;
  principleId: string;
  concept: string;
  explanation: string;
  examples: string[];
  analogies: string[];
  questions: { q: string; a: string }[];
  challenges: string[];
  sourceIds: string[];         // References to RawContent
  difficulty: 'foundational' | 'intermediate' | 'advanced';
  estimatedMinutes: number;
  status: 'draft' | 'approved' | 'rejected';
}

interface UserProgress {
  id: string;
  userId: string;
  knowledgeUnitId: string;
  masteryLevel: number;        // 0-100
  phase: 'memorize' | 'recite' | 'perform' | 'transfer';
  easeFactor: number;          // SM-2 algorithm
  interval: number;            // Days until next review
  nextReviewDate: Date;
  repetitions: number;
  lastAttemptAt: Date;
}
```

---

## Open Questions for Discussion

1. **Learning Map Refinement Loop**: Should sourced content be able to *refine* the learning map? (e.g., "Based on available content, here's an adjusted map")

2. **Arcade MVP**: Is there a minimal arcade experience that should be in v1, or is it cleanly post-MVP?

3. **Mentor Matching**: Do we need user stories for mentor onboarding/matching, or is AI-only feedback sufficient for MVP?

4. **Cross-Path Insights**: If a user has multiple paths, should the system recognize overlapping concepts?

5. **Template Sharing**: Is there a need for "use someone else's learning map as a template" in MVP?

---

*Document generated: January 2026*
