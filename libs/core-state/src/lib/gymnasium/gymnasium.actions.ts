import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Session, SessionTemplate, GenerateSessionDto } from '@kasita/common-models';

export const GymnasiumActions = createActionGroup({
  source: 'Gymnasium API',
  events: {
    'Select Session': props<{ selectedId: string }>(),
    'Reset Selected Session': emptyProps(),
    'Reset Sessions': emptyProps(),

    // Load all sessions
    'Load Sessions': emptyProps(),
    'Load Sessions Success': props<{ sessions: Session[]; total: number }>(),
    'Load Sessions Failure': props<{ error: string | null }>(),

    // Load public sessions
    'Load Public Sessions': props<{ limit?: number }>(),
    'Load Public Sessions Success': props<{ sessions: Session[] }>(),
    'Load Public Sessions Failure': props<{ error: string | null }>(),

    // Load single session
    'Load Session': props<{ sessionId: string }>(),
    'Load Session Success': props<{ session: Session }>(),
    'Load Session Failure': props<{ error: string | null }>(),

    // Load session by slug
    'Load Session By Slug': props<{ slug: string }>(),
    'Load Session By Slug Success': props<{ session: Session }>(),
    'Load Session By Slug Failure': props<{ error: string | null }>(),

    // Render session by slug (get HTML)
    'Render Session By Slug': props<{ slug: string; templateId?: string }>(),
    'Render Session By Slug Success': props<{ slug: string; html: string }>(),
    'Render Session By Slug Failure': props<{ error: string | null }>(),

    // Render session (get HTML)
    'Render Session': props<{ sessionId: string; templateId?: string }>(),
    'Render Session Success': props<{ sessionId: string; html: string }>(),
    'Render Session Failure': props<{ error: string | null }>(),

    // CRUD
    'Create Session': props<{ session: Partial<Session> }>(),
    'Create Session Success': props<{ session: Session }>(),
    'Create Session Failure': props<{ error: string | null }>(),

    'Update Session': props<{ id: string; changes: Partial<Session> }>(),
    'Update Session Success': props<{ session: Session }>(),
    'Update Session Failure': props<{ error: string | null }>(),

    'Delete Session': props<{ session: Session }>(),
    'Delete Session Success': props<{ session: Session }>(),
    'Delete Session Failure': props<{ error: string | null }>(),

    // Publish/Unpublish
    'Publish Session': props<{ sessionId: string }>(),
    'Publish Session Success': props<{ session: Session }>(),
    'Publish Session Failure': props<{ error: string | null }>(),

    'Unpublish Session': props<{ sessionId: string }>(),
    'Unpublish Session Success': props<{ session: Session }>(),
    'Unpublish Session Failure': props<{ error: string | null }>(),

    // AI Generation
    'Generate Session': props<{ dto: GenerateSessionDto }>(),
    'Generate Session Success': props<{ session: Session }>(),
    'Generate Session Failure': props<{ error: string | null }>(),

    // Templates
    'Load Templates': emptyProps(),
    'Load Templates Success': props<{ templates: SessionTemplate[] }>(),
    'Load Templates Failure': props<{ error: string | null }>(),

    'Load Default Template': emptyProps(),
    'Load Default Template Success': props<{ template: SessionTemplate }>(),
    'Load Default Template Failure': props<{ error: string | null }>(),
  },
});
