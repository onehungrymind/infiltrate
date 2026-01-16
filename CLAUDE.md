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
