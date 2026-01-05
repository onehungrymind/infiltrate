# Cursor Prompt Template

Copy and paste this at the start of any Cursor conversation about Kasita.

---

## Standard Prompt

```
I'm working on Kasita MVP - a knowledge acquisition platform.

Context is in .claude/context/:
- tech-stack.md - Technology decisions (Nest.js, Angular, TypeORM, Python)
- mvp-schema.md - Data model (5 entities: LearningPath, SourceConfig, RawContent, KnowledgeUnit, UserProgress)
- architecture.md - System architecture (API-first, Python workers, Angular clients)
- setup-guide.md - Setup commands and troubleshooting

Key facts:
- Nx monorepo with Angular 21, Nest.js 10, Python 3.11+
- TypeORM + Turso (local) / Neon (prod)
- Python apps call API via HTTP (not direct DB access)
- MVP schema is simplified subset of full schema (in libs/common-models/src/lib/full-schema.ts)

Current task: [YOUR TASK HERE]
```

---

## Task-Specific Prompts

### Backend/API Work

```
Working on Kasita API (Nest.js + TypeORM).

Context: .claude/context/mvp-schema.md and tech-stack.md

Stack:
- Nest.js 10 with TypeORM
- TypeScript strict mode
- Validation with class-validator
- Swagger/OpenAPI docs

Current entity: [ENTITY NAME]
Task: [YOUR TASK]

Constraints:
- Use TypeORM decorators (@Entity, @Column, etc.)
- All DTOs must have class-validator decorators
- Follow REST conventions
- Add Swagger @ApiProperty decorators
```

### Frontend/Angular Work

```
Working on Kasita Console/Infiltrate (Angular 21).

Context: .claude/context/mvp-schema.md and architecture.md

Stack:
- Angular 21
- NgRx for state
- Angular Material + Tailwind
- RxJS for async

Current feature: [FEATURE NAME]
Task: [YOUR TASK]

Constraints:
- Use OnPush change detection
- All services inject HttpClient
- Import types from @kasita/common-models
- Follow Material Design guidelines
```

### Python Work

```
Working on Kasita Python apps (Patchbay/Synthesizer).

Context: .claude/context/tech-stack.md and architecture.md

Stack:
- Python 3.11+ with uv
- Shared venv at root (.venv/)
- httpx for API calls
- Pydantic for validation

Current app: [PATCHBAY or SYNTHESIZER]
Task: [YOUR TASK]

Constraints:
- All API communication via httpx (async)
- Use python_shared.api_client for API calls
- Emit progress via POST /api/ingestion/progress
- Follow existing adapter/processor patterns
```

### Full-Stack Feature

```
Working on Kasita end-to-end feature.

Context: All files in .claude/context/

Stack: Nx monorepo with Angular, Nest.js, Python

Feature: [FEATURE NAME - e.g., "Content ingestion flow"]

Components needed:
- [ ] API endpoint (Nest.js)
- [ ] Database entity (TypeORM)
- [ ] Angular service (core-data)
- [ ] NgRx state (core-state)
- [ ] Angular component (dashboard/infiltrate)
- [ ] Python integration (if needed)

Task: [YOUR TASK]

Show me the implementation for: [SPECIFIC COMPONENT]
```

### Debugging

```
Debugging Kasita issue.

Context: .claude/context/setup-guide.md

Error: [PASTE ERROR MESSAGE]

What I've tried:
- [WHAT YOU TRIED]

Stack trace / logs:
[PASTE LOGS]

Help me debug this.
```

---

## Response Format Preferences

### For Code Generation

```
When generating code:
1. Show the full file path in a comment at the top
2. Include all imports
3. Add brief inline comments for complex logic
4. Follow the existing patterns in the codebase
5. Use TypeScript/Python type hints

Example:
// apps/api/src/app/learning-paths/learning-paths.service.ts
import { Injectable } from '@nestjs/common';
// ... rest of code
```

### For Explanations

```
When explaining:
1. Start with a brief summary
2. Show code examples
3. Explain the "why" not just the "how"
4. Mention any gotchas or edge cases
5. Reference relevant context files if applicable
```

### For Refactoring

```
When refactoring:
1. Show "before" and "after" code
2. Explain what changed and why
3. List any breaking changes
4. Provide migration steps if needed
5. Update any affected files
```

---

## Common Tasks Quick Reference

### Create a new API endpoint

```
Create new API endpoint for [FEATURE].

Show me:
1. Entity definition with TypeORM decorators
2. DTOs with validation
3. Service implementation
4. Controller with REST endpoints
5. Module wiring

Follow patterns in existing resources (e.g., learning-paths).
```

### Create Angular component connected to API

```
Create Angular component for [FEATURE].

Show me:
1. Service in core-data (HTTP calls)
2. NgRx actions/reducer/effects in core-state
3. Component with Material UI
4. Wire up to store with selectors

Use existing patterns from dashboard/learning-paths.
```

### Add Python API integration

```
Add API integration to [PATCHBAY or SYNTHESIZER].

Show me:
1. API client method in python_shared/api_client.py
2. Usage in main workflow
3. Error handling
4. Progress emission

Follow existing patterns in the Python apps.
```

---

## Examples of Good Prompts

### Example 1: Specific and Contextual

```
I'm implementing the knowledge units review UI in Console (Angular).

Context: mvp-schema.md - KnowledgeUnit has status: 'pending' | 'approved' | 'rejected'

I need:
1. Component that fetches pending units
2. Card UI showing concept, question, answer
3. Three buttons: Approve, Edit, Reject
4. When approved: PATCH /api/knowledge-units/:id { status: 'approved' }

Show me the component implementation using Material UI.
```

### Example 2: Debugging with Context

```
Getting TypeORM error when starting API:

Error: "EntityMetadataNotFoundError: No metadata for KnowledgeUnit"

I've:
- Added @Entity() decorator
- Included in entities array in app.module.ts
- Rebuilt with nx build api

Context: tech-stack.md, setup-guide.md

What am I missing?
```

### Example 3: Following Patterns

```
I need to add SM-2 algorithm implementation for spaced repetition.

Context: mvp-schema.md - UserProgress entity has SM-2 fields

Reference: The algorithm pseudocode is in mvp-schema.md

Create:
1. SM2Service in apps/api/src/app/user-progress/
2. Method: calculateNext(easinessFactor, interval, repetitions, quality)
3. Use this in POST /api/user-progress/attempt endpoint

Show me the service implementation.
```

---

## Anti-Patterns (What NOT to Do)

❌ **Too Vague**
```
Help me with the API
```

✅ **Better**
```
I'm implementing POST /api/knowledge-units/bulk endpoint.
Context: mvp-schema.md - CreateKnowledgeUnitDto
Show me the controller method and service implementation.
```

---

❌ **No Context**
```
Why isn't my component working?
```

✅ **Better**
```
My Angular component isn't receiving data from the store.

Component: apps/dashboard/src/app/learning-paths/learning-paths-list.component.ts
Store: libs/core-state/src/lib/learning-paths/

Error: paths$ observable never emits

Show me what to check.
```

---

❌ **Ignoring Existing Patterns**
```
Create a new REST API for challenges
```

✅ **Better**
```
Create REST API for challenges (post-MVP feature).

Context: mvp-schema.md (challenges not in MVP, but in full-schema.ts)
Pattern: Follow same structure as learning-paths resource

Show me:
1. Entity
2. DTOs
3. Controller/Service
4. Module
```

---

## Tips for Better Results

1. **Always mention context files** - ".claude/context/mvp-schema.md"
2. **Be specific about file paths** - "apps/api/src/app/..."
3. **Reference existing patterns** - "like learning-paths resource"
4. **Include error messages** - Paste the actual error
5. **Show what you've tried** - "I tried X but got Y"
6. **Ask for explanations** - "Why does this pattern work?"
7. **Request examples** - "Show me an example from the codebase"

---

## Helpful Cursor Commands

```bash
# In Cursor terminal
nx serve api              # Start API (use @Terminal)
nx serve dashboard        # Start Console
nx graph                  # Show project dependencies
nx affected:test          # Test affected projects
```

---

## Update This Template

As the project evolves:
1. Add new common patterns
2. Update context file references
3. Add new task-specific prompts
4. Document new anti-patterns

This is a living document. Keep it updated!
