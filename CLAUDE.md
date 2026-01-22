# Kasita Project Notes

## API Configuration

- **API Port: 3333** (NOT 3000!)
- Seed endpoint: `curl -X POST http://localhost:3333/api/seed`

## Users

- Test user: `test@test.com` / `insecure` (role: user)
- Mentor user: `mentor@test.com` / `insecure` (role: mentor)

**Important:** To see the mentor dashboard with submissions, log in as the **mentor** user (`mentor@test.com`). The mentor dashboard only shows submissions for learning paths where the logged-in user is the assigned mentor.

## Tech Stack

- Backend: NestJS (apps/api)
- Frontend: Angular 17+ with standalone components and signals (apps/dashboard)
- State Management: NgRx
- Database: SQLite with TypeORM

## Important Reminders

- When adding new NgRx effects, they must be:
  1. Exported from `libs/core-state/src/index.ts`
  2. Registered in `apps/dashboard/src/app/app.config.ts` (both import and provideEffects)

## UI Consistency Rules (MANDATORY)

**BEFORE writing ANY new UI component, you MUST:**

1. **Find 2-3 existing components** that do something similar and READ their HTML/SCSS files
2. **Use the EXACT same patterns** - do NOT invent new approaches
3. **Never use Material form fields** (`mat-form-field`, `matInput`) - the app uses custom form styling

**Standard Patterns:**

- **Admin pages**: Use `app-pipeline-column` components in `.columns-container` layout (see `learning-paths.html`)
- **Editor panels**: Use `.editor-panel` that slides open (see `learning-paths.html`)
- **Forms**: Use `app-dynamic-form` component OR manual `.form-group` / `.form-label` / `.form-control` classes (see `dynamic-form.scss`)
- **Buttons**: Use `.detail-button` / `.detail-button-primary` / `.detail-button-secondary` classes (see `learning-path-detail.scss`)
- **Item cards**: Use `.item-card` / `.item-title` / `.item-description` / `.item-meta` classes

**DO NOT:**
- Use `mat-form-field` with floating labels
- Invent new CSS class naming conventions
- Create dropdown/select filters when column-based selection is the pattern
- Say "done" without checking the rendered output matches existing pages

## Common Commands

```bash
# Start API
npx nx serve api

# Start Dashboard
npx nx serve dashboard

# Build
npx nx build api
npx nx build dashboard

# Seed database
curl -X POST http://localhost:3333/api/seed
```
