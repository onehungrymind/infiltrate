# Kasita 🏠

> Your Knowledge Casita - A second brain for mastering complex topics through structured, gamified learning.

## What is Kasita?

Kasita (a play on "casita" - Spanish for "little house") is a comprehensive Knowledge Acquisition System (KAS) designed to help you rapidly master complex technical topics and convincingly demonstrate expertise in any social or professional setting.

Just as a casita is an auxiliary structure adjacent to your main house, Kasita serves as an auxiliary knowledge structure adjacent to your main brain - a personalized, focused learning space where knowledge is systematically acquired, retained, and deployed.

## The Philosophy

Kasita is built on a simple but powerful premise: **the majority of what is discussed on any topic (80%) is covered by a solid understanding of core principles (20%)**. 

Rather than attempting to master everything about a subject, Kasita helps you identify and internalize the high-signal concepts that professionals actually discuss, enabling you to:

- **Infiltrate** technical conversations with confidence
- **Convince** others of your expertise through quality of delivery
- **Retain** knowledge through scientifically-proven spaced repetition
- **Progress** from memorization to mastery through structured phases

## Core Methodology: Infiltrate

The flagship learning approach in Kasita is called **Infiltrate** - a three-phase system for absorbing the most essential concepts of a topic:

### Phase 1: Memorization
Master core principles through flashcards and spaced repetition. Focus on committing the fundamental concepts to memory with precision.

### Phase 2: Recitation
Practice articulating these principles out loud. Build confidence in your ability to explain concepts clearly and naturally without reading.

### Phase 3: Performance
Demonstrate understanding through whiteboard explanations and elaboration. Prove you can teach the concept to others and answer follow-up questions.

This methodology draws inspiration from interview preparation but extends beyond it - you're not just preparing for a specific event, you're building durable expertise.

## Features

### 🎴 Intelligent Flashcard System
- Spaced repetition algorithm (SM-2) for optimal review timing
- Multiple formats: flashcards, quizzes, challenges, games
- Track mastery levels from "learning" to "expert"

### 🎯 Learning Paths
- Curated progressions through knowledge domains
- Prerequisite tracking and dependency management
- Hierarchical topic organization (Domain → Topic → Knowledge Unit)

### 📊 Progress Analytics
- Session tracking and performance metrics
- Identify weak spots and strong domains
- Streak tracking and time-based insights
- Personal learning pattern analysis

### 🎮 Gamification
- Achievement system for milestones
- Leaderboards for competitive learning
- Multiple game formats for engagement
- Point multipliers and challenge modes

### 🧠 Knowledge Graph
- Related concept linking
- Prerequisite mapping
- Multiple learning paths to the same knowledge
- Bloom's taxonomy cognitive level tracking

### 🌐 Web-First Design
- Study anywhere, any device
- Progressive Web App support
- Offline-capable flashcard decks
- Export to Anki, Quizlet, PDF, and more

## Project Structure

```
kasita/
├── apps/
│   ├── infiltrate/        # Infiltrate flashcard application (Angular)
│   ├── infiltrate-e2e/    # E2E tests for infiltrate
│   ├── dashboard/         # Analytics and progress tracking (Angular)
│   ├── dashboard-e2e/     # E2E tests for dashboard
│   ├── api/               # Backend API services (NestJS)
│   └── api-e2e/           # E2E tests for API
├── libs/
│   ├── common-models/     # Shared data models and types
│   ├── core-data/         # HTTP client services
│   └── core-state/        # NgRx feature slices and state management
└── docs/                  # Documentation and guides
```

## Technology Stack

- **TypeScript** - Type-safe development across the entire stack
- **Angular 21** - Component-based UI framework with standalone components
- **NestJS** - Backend API framework with Express
- **NgRx** - State management with Store, Effects, and Entity
- **Nx 22** - Monorepo management and build optimization
- **Vitest** - Unit testing framework
- **Playwright** - End-to-end testing
- **ESLint** - Code linting
- **Prettier** - Code formatting

## Data Model

Kasita's data model is built around four core concepts:

### 1. Knowledge Units
The atomic building blocks of learning - a single concept, question, and answer with supporting context (examples, analogies, common mistakes, sources).

### 2. Learning Activities
Different ways to engage with knowledge: flashcards, quizzes, games, whiteboard challenges, verbal recitation. Each activity type has custom configuration and tracks progress independently.

### 3. Learning Paths
Structured progressions through knowledge with phases, completion criteria, and estimated time commitments. Infiltrate decks are a specialized type of learning path.

### 4. User Progress
Granular tracking of mastery levels, spaced repetition scheduling, attempt history, and performance analytics.

See [`libs/common-models`](./libs/common-models) for the complete TypeScript definitions.

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL (for local development)

### Installation

```bash
# Clone the repository
git clone https://github.com/onehungrymind/kasita.git
cd kasita

# Install dependencies
npm install

# Start development servers
npm run serve:infiltrate    # Start infiltrate app (default: http://localhost:4200)
npm run serve:dashboard     # Start dashboard app
npm run serve:api           # Start API server
```

### Available Commands

**Development:**
- `npm run serve:infiltrate` - Start infiltrate app
- `npm run serve:dashboard` - Start dashboard app
- `npm run serve:api` - Start API server
- `npm start` / `npm run dev` - Start infiltrate (default)

**Building:**
- `npm run build:infiltrate` - Build infiltrate app
- `npm run build:dashboard` - Build dashboard app
- `npm run build:api` - Build API server
- `npm run build:prod:infiltrate` - Production build for infiltrate
- `npm run build:prod:dashboard` - Production build for dashboard
- `npm run build:prod:api` - Production build for API

**Testing:**
- `npm run test:infiltrate` - Run infiltrate unit tests
- `npm run test:dashboard` - Run dashboard unit tests
- `npm run test:api` - Run API unit tests
- `npm run e2e:infiltrate` - Run infiltrate E2E tests
- `npm run e2e:dashboard` - Run dashboard E2E tests
- `npm run e2e:api` - Run API E2E tests

**Code Quality:**
- `npm run lint:infiltrate` - Lint infiltrate app
- `npm run lint:dashboard` - Lint dashboard app
- `npm run lint:api` - Lint API server
- `npm run format` - Format all code
- `npm run format:check` - Check code formatting

### Quick Start: Using the Applications

**Infiltrate App:**
The main flashcard application for learning ML/AI concepts. See the [Infiltrate README](./apps/infiltrate/README.md) for detailed documentation.

**Dashboard App:**
Administration and analytics interface for tracking learning progress, managing knowledge units, and viewing insights.

**API Server:**
Backend REST API built with NestJS for managing data, authentication, and serving the frontend applications.

**Shared Libraries:**
- `@kasita/common-models` - Shared data models and types
- `@kasita/core-data` - HTTP client services for API communication
- `@kasita/core-state` - NgRx feature slices for state management

## Example Use Cases

### Technical Interview Preparation
Load system design concepts, coding patterns, and behavioral questions into Infiltrate decks. Progress through memorization → recitation → whiteboard phases to build genuine confidence.

### New Technology Onboarding
When joining a new team or learning a new framework, create knowledge units for core concepts, best practices, and team-specific patterns.

### Conference Talk Preparation
Build deep knowledge of your talk topic by creating units for every concept you'll discuss, ensuring you can handle any audience question.

### Certification Study
Import certification exam topics into Kasita, track mastery levels, and use spaced repetition to ensure long-term retention beyond the exam date.

## Roadmap

### Current (v0.1)
- [x] Core data model definition (`common-models`)
- [x] Infiltrate flashcard web application (Angular)
- [x] Dashboard application (Angular)
- [x] API server (NestJS)
- [x] Core data library for HTTP services
- [x] Core state library for NgRx state management
- [x] Basic spaced repetition algorithm
- [ ] User authentication and profiles
- [ ] PostgreSQL backend implementation

### Near-term (v0.2)
- [ ] Complete analytics dashboard implementation
- [ ] Learning path creation UI
- [ ] Export to Anki/Quizlet
- [ ] Mobile-responsive improvements
- [ ] Whiteboard challenge interface
- [ ] API endpoints for data persistence

### Medium-term (v0.3)
- [ ] Gamification system
- [ ] Leaderboards and achievements
- [ ] Community-contributed knowledge units
- [ ] AI-assisted knowledge unit generation
- [ ] Voice recording for recitation phase

### Long-term (v1.0)
- [ ] Native mobile applications
- [ ] Collaborative learning paths
- [ ] Integration with Obsidian/Notion
- [ ] Advanced analytics and ML-powered insights
- [ ] Marketplace for premium learning paths

## Philosophy & Design Principles

### 1. 80/20 Learning
Focus on high-signal concepts that provide maximum conversational coverage. Quality over quantity.

### 2. Progressive Mastery
Move through distinct phases: memorize → recite → perform → teach. Each phase builds genuine capability.

### 3. Spaced Repetition Over Cramming
Knowledge that sticks requires strategic review intervals. Kasita handles the scheduling so you focus on learning.

### 4. Performance-Oriented
The goal isn't just to know something, it's to convincingly demonstrate expertise in real situations - interviews, meetings, conversations.

### 5. Second Brain, Not Replacement Brain
Kasita is auxiliary to your main thinking, not a replacement for it. It's a structured space for deliberate knowledge acquisition.

### 6. Web-First, Consumption-Maximized
Learning happens everywhere. Kasita works on any device, any time, optimized for quick study sessions and deep dives alike.

## Contributing

Kasita is open source and contributions are welcome! Whether you're:

- Adding knowledge units for popular topics
- Building new activity types or game formats
- Improving the spaced repetition algorithm
- Creating learning path templates
- Enhancing the UI/UX

Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## The Origin Story

Kasita emerged from a personal need to rapidly acquire expertise in AI/ML engineering after years of DevOps and traditional software engineering. The "Infiltrate" methodology was born from the realization that most technical conversations revolve around a core set of principles, and mastering those principles with confidence is more valuable than surface-level knowledge of everything.

The name "Kasita" reflects the goal: create a personal, focused learning space adjacent to your main knowledge - your second brain, where systematic learning happens.

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Acknowledgments

- Inspired by spaced repetition pioneers like Piotr Woźniak (SuperMemo/SM-2 algorithm)
- Influenced by Bloom's Taxonomy for cognitive skill progression
- Built for learners who want to move fast and retain knowledge
- Named after the humble casita - a small structure with big purpose

---

**Built with 🧠 by [Lukas Ruebbelke](https://fanfa.dev)**

*"The casita isn't the main house, but it's where the magic happens."*