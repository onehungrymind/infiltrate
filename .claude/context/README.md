# Claude Context for Kasita

This directory contains context from claude.ai conversations to bridge between claude.ai (planning/architecture) and Cursor (implementation).

---

## Quick Start

### In Cursor

Copy this prompt to start any conversation:

```
I'm working on Kasita MVP.

Context in .claude/context/:
- tech-stack.md
- mvp-schema.md  
- architecture.md
- setup-guide.md

Current task: [YOUR TASK]
```

See `cursor-prompt.md` for more templates.

---

## Directory Structure

```
.claude/
├── README.md              # This file
├── context/
│   ├── tech-stack.md      # Technology decisions
│   ├── mvp-schema.md      # Data model
│   ├── architecture.md    # System architecture
│   ├── setup-guide.md     # Setup commands
│   └── cursor-prompt.md   # Prompt templates
└── conversations/         # Exported conversations (optional)
```

---

## Context Files

### tech-stack.md
**What**: Final technology decisions  
**Use When**: Need to know which libraries/tools we're using  
**Key Info**: 
- Database: TypeORM + Turso/Neon
- Frontend: Angular 21 + NgRx
- Backend: Nest.js
- Python: uv + httpx + Claude API

### mvp-schema.md
**What**: Complete MVP data model  
**Use When**: Working with entities, DTOs, or database  
**Key Info**:
- 5 core entities
- TypeORM decorators
- Validation rules
- SM-2 algorithm

### architecture.md
**What**: System architecture and data flow  
**Use When**: Understanding how components interact  
**Key Info**:
- Component responsibilities
- Data flow diagrams
- API endpoints
- Python ↔ API integration

### setup-guide.md
**What**: Step-by-step setup commands  
**Use When**: Setting up project or troubleshooting  
**Key Info**:
- Installation commands
- Configuration steps
- Testing procedures
- Troubleshooting tips

### cursor-prompt.md
**What**: Prompt templates for Cursor  
**Use When**: Starting a Cursor conversation  
**Key Info**:
- Standard prompts
- Task-specific templates
- Examples of good prompts
- Anti-patterns to avoid

---

## Workflow

### Planning in claude.ai
Use for:
- Architecture decisions
- Data model design
- Technology selection
- Strategic planning
- Complex problem-solving

**Why**: Better for long-form discussion and exploration

### Implementation in Cursor
Use for:
- Writing code
- Debugging
- File-specific changes
- Quick iterations
- Code refactoring

**Why**: Has your full codebase context

### Bridge with Context Files
1. Make decisions in claude.ai
2. Document in context files (here)
3. Reference in Cursor conversations
4. Maintain momentum across tools

---

## How to Use Context Files in Cursor

### Method 1: Reference in Prompt
```
Context: .claude/context/mvp-schema.md

I'm implementing the KnowledgeUnit entity...
```

Cursor will read the file and use it as context.

### Method 2: Open Files
1. Open context file in Cursor editor
2. Start chat
3. Cursor automatically includes open files as context

### Method 3: Explicit Request
```
Read .claude/context/tech-stack.md and tell me which database we're using.
```

---

## Maintaining Context Files

### When to Update

**After major decisions**:
- Technology changes
- Architecture changes
- Data model changes

**When adding features**:
- Update setup-guide.md with new commands
- Update architecture.md with new components
- Update cursor-prompt.md with new patterns

**During development**:
- Add troubleshooting tips to setup-guide.md
- Document new patterns in cursor-prompt.md
- Update tech-stack.md with library versions

### How to Update

1. Make changes in claude.ai (planning)
2. Export updated sections
3. Update relevant context files
4. Commit to version control
5. Use updated context in Cursor

---

## Tips for Success

### Do ✅
- Keep context files concise and scannable
- Update after major changes
- Use consistent formatting
- Add examples and code snippets
- Include file paths
- Reference context files in prompts
- Version control this directory

### Don't ❌
- Make files too long (break into sections)
- Include outdated information
- Copy entire codebases
- Duplicate information across files
- Forget to update after changes

---

## File Size Guidelines

**Optimal**: 200-500 lines per file  
**Maximum**: 1000 lines per file  
**If larger**: Split into multiple files

Current files are all under 500 lines for optimal Claude performance.

---

## Advanced Usage

### Conversation Exports (Optional)

Save important planning conversations:

```bash
# In .claude/conversations/
2026-01-05-mvp-planning.md
2026-01-12-data-model-refinement.md
2026-01-20-python-integration.md
```

Reference in Cursor:
```
See .claude/conversations/2026-01-05-mvp-planning.md for original context.
```

### Custom Context for Features

Create feature-specific context:

```bash
.claude/context/features/
├── ingestion-flow.md
├── flashcard-system.md
└── progress-tracking.md
```

### Project-Specific Prompts

Add to cursor-prompt.md:
- Common debugging scenarios
- Frequently used commands
- Code patterns specific to Kasita
- Team conventions

---

## Integration with Development Workflow

```bash
# Daily workflow
1. Plan in claude.ai (architecture, decisions)
   ↓
2. Update context files (document decisions)
   ↓
3. Implement in Cursor (reference context)
   ↓
4. Commit code + updated context
   ↓
5. Repeat
```

---

## Troubleshooting

### Issue: Cursor not reading context files
**Solution**: 
- Open file in editor first
- Reference explicitly: "Read .claude/context/X.md"
- Check file path is correct

### Issue: Context files outdated
**Solution**:
- Review and update after major changes
- Add "Last Updated" date to files
- Set reminder to review monthly

### Issue: Too much context
**Solution**:
- Be selective about which files to reference
- Use task-specific prompts
- Keep files focused and concise

---

## Examples

### Good Usage
```
// Cursor chat
I'm adding WebSocket support for progress updates.

Context: 
- .claude/context/architecture.md (see WebSocket section)
- .claude/context/tech-stack.md (Socket.io is listed)

Show me how to implement the gateway.
```

### Better Usage
```
// Cursor chat with opened file
[File open: .claude/context/architecture.md]

I'm implementing the ProgressGateway shown in the WebSocket section.
Already have Socket.io installed (per tech-stack.md).

Show me the implementation matching the architecture.
```

---

## Contributing

When you discover useful patterns:

1. Document in cursor-prompt.md
2. Add examples to relevant context files
3. Update this README if needed
4. Commit with clear message

Keep the knowledge flowing! 🌊

---

## Version History

- **2026-01-05**: Initial context files created
- **Next**: Update as project evolves

---

## Questions?

If context files don't answer your question:
1. Check if information exists in full-schema.ts
2. Search codebase for examples
3. Ask in claude.ai for planning
4. Ask in Cursor for implementation

This system bridges the gap between strategic planning and tactical implementation. Use it to maintain momentum! 🚀
