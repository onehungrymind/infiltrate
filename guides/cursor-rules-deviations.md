# Cursor Rules Deviations (Ruleset vs Repo Reality)

This document captures **where the current codebase deviates from the guidance in**:

- `.cursor/.cursorrules`
- `.cursor/.cursorrules.angular`
- `.cursor/.cursorrules.nestjs`
- `.cursor/.cursorrules.nx`
- `.cursor/.cursorrules.python`
- `.cursor/.cursorrules.react` (not evaluated deeply since this repo is not React/Next-based)

The goal is not to judge “right vs wrong”, but to make mismatches explicit so you can decide what to **enforce**, what to **relax**, and what to **rewrite to match reality**.

---

## Angular (Dashboard / Infiltrate)

| Ruleset claim | Repo reality | Evidence | Why it matters | Suggested resolution |
|---|---|---|---|---|
| **“Always use new control flow (`@if`, `@for`, `@switch`, `@defer`); never use `*ngIf/*ngFor`.”** | The repo is **mixed**: newer templates use `@if/@for`, but some templates still use `*ngIf`. | `apps/dashboard/src/app/app.html` uses `*ngIf` on `app-sidebar` and `app-header` (L1, L6). | Agents may “fix” templates to new syntax mid-feature, creating inconsistent style and noisy diffs. | Decide if `*ngIf/*ngFor` are allowed in existing files, or if the project will migrate them gradually (and document that policy explicitly). |
| **“Avoid logic in templates—use computed signals instead.”** | Templates call component methods and do non-trivial work at render-time. | `apps/dashboard/src/app/users/user-detail/user-detail.html` calls `getField()`, `hasErrors()`, `getErrorMessages()` (e.g. L10–L13, L72–L76, L133–L135). | Method calls can be fine, but if rules forbid them, agents will try to rewrite code to comply, potentially over-engineering. | Either relax the rule (“avoid heavy logic, small helpers ok”) or refactor systematically later. |
| **“Signals-first I/O: `input()/output()/model()` required for new code.”** | Repo uses **both**: signals inside components, but classic `@Input/@Output` is still common. | `apps/dashboard/src/app/users/users-list/users-list.ts` uses `@Input()`/`@Output()` (L17–L22). | Agents may introduce a third pattern (signals I/O) inconsistently across feature boundaries. | Pick a clear policy: either “signals I/O only for new components” or “prefer existing style per folder/app”. |
| **“Use OnPush change detection by default.”** | OnPush isn’t consistently visible/used in dashboard components (based on earlier scan). | (Repo-wide scan indicated no `ChangeDetectionStrategy.OnPush` usage in `apps/dashboard/src`.) | If rules say OnPush is mandatory, agents will add it everywhere—often with follow-on bugs if templates rely on default CD semantics. | Make OnPush either a “new code preference” or enforce it with a measured migration plan. |

---

## NgRx / State Management

| Ruleset claim | Repo reality | Evidence | Why it matters | Suggested resolution |
|---|---|---|---|---|
| **“Signals-first reactive state management (and optional NgRx Signals examples).”** | The repo’s primary state pattern is classic **NgRx Store + Effects** with `provideStore()` + `provideEffects()`. | `apps/dashboard/src/app/app.config.ts` wires `provideStore(...)` and a large `provideEffects({...})` map (L85–L145). | Agents may try to introduce `@ngrx/signals` or “signals stores” in parallel, fragmenting state patterns. | Clarify: “This repo uses NgRx Store/Effects as the default. Signals are for local component state and forms.” |

---

## NestJS (API)

| Ruleset claim | Repo reality | Evidence | Why it matters | Suggested resolution |
|---|---|---|---|---|
| **“Controllers return DTOs, never entities.”** | Some controllers return whatever the service returns (entity or plain object) without mapping. | `apps/api/src/users/users.controller.ts` returns `usersService.*()` directly (L12–L40). | Agents may start introducing DTO mapping inconsistently across modules. | Decide if you want DTO mapping everywhere (then add a shared pattern), or explicitly allow returning entities for MVP. |
| **“Never expose sensitive fields (e.g., password).”** | `UsersService.findOne()` explicitly selects and returns `user.password`. | `apps/api/src/users/users.service.ts` selects `user.password` (L56) and returns it in the response object (L69–L79). | This is the most “best practice” sensitive mismatch; it can create security risk and also conflicts with the ruleset’s guidance. | If intentional for editing flows, document the exception (e.g. “password is only returned for admin edit forms” or return a placeholder instead). |
| **“Use parameter pipes like `ParseUUIDPipe` (fail fast at boundary).”** | `id` params are plain strings without explicit parsing/validation pipes in controllers. | `apps/api/src/users/users.controller.ts` uses `@Param('id') id: string` (L26–L33, L38–L39). | Without pipes, invalid IDs propagate deeper before failing; agents following the rules may add pipes inconsistently. | Either adopt pipes project-wide or relax the rule to “validate in service for MVP.” |

---

## Nx (Workspace conventions)

| Ruleset claim | Repo reality | Evidence | Why it matters | Suggested resolution |
|---|---|---|---|---|
| **“Use tags (`type:*`, `scope:*`) and enforce module boundaries.”** | Most projects have empty `tags: []` today. | `libs/core-data/project.json` has `tags: []` (L7). `libs/core-state/project.json` has `tags: []` (L7). | The Nx ruleset describes a tag-driven architecture that the workspace metadata doesn’t implement; agents may generate new libs that don’t match existing conventions. | Either adopt tags + constraints (recommended long-term) or rewrite `.cursorrules.nx` to match current “core-* libs” architecture. |
| **Nx “library taxonomy” (`feature-*`, `data-access-*`, `domain-*`, etc.).** | Repo uses a different naming scheme (`core-data`, `core-state`, `common-models`, `material`). | Existing library names: `libs/core-data`, `libs/core-state`, etc. (see project layout + `project.json` names). | Agents may propose reorganizing or naming new libs inconsistently with current structure. | Clarify the repo’s chosen lib taxonomy and when/if you plan to migrate. |

---

## Python (Patchbay / Synthesizer)

| Ruleset claim | Repo reality | Evidence | Why it matters | Suggested resolution |
|---|---|---|---|---|
| **“Type hints required on all function signatures.”** | Some entrypoints are untyped. | `apps/patchbay/src/main.py` defines `def main():` without return type (L14). | If the rules are strict, agents will add annotations everywhere (often fine), but could cause churn. | Make typing “required for new functions” vs “require migration to add types everywhere.” |
| **“Avoid sys.path hacks; use clean packaging.”** | Patchbay modifies `sys.path` for imports. | `apps/patchbay/src/main.py` uses `sys.path.insert(...)` (L6–L7). | Agents may try to restructure packaging automatically. | Document this as an accepted pragmatic choice until packaging is refactored. |

---

## Notes / gaps

- This table focuses on **representative, high-impact mismatches** (style, architecture, security).
- There are likely more (testing expectations, error handling patterns, DTO vs entity usage, etc.) that can be added iteratively.
- If you want, we can add a second table that’s “**rules we’re already following well**” to avoid over-correcting.

