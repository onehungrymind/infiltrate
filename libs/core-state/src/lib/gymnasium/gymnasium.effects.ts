import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Session, SessionTemplate } from '@kasita/common-models';
import { GymnasiumService, formatErrorMessage } from '@kasita/core-data';
import { of } from 'rxjs';
import { catchError, exhaustMap, map } from 'rxjs/operators';
import { GymnasiumActions } from './gymnasium.actions';

export const loadSessions = createEffect(
  (
    actions$ = inject(Actions),
    gymnasiumService = inject(GymnasiumService),
  ) => {
    return actions$.pipe(
      ofType(GymnasiumActions.loadSessions),
      exhaustMap(() =>
        gymnasiumService.findAllSessions().pipe(
          map((result) =>
            GymnasiumActions.loadSessionsSuccess({
              sessions: result.sessions,
              total: result.total,
            }),
          ),
          catchError((error) =>
            of(
              GymnasiumActions.loadSessionsFailure({
                error: formatErrorMessage(error),
              }),
            ),
          ),
        ),
      ),
    );
  },
  { functional: true },
);

export const loadPublicSessions = createEffect(
  (
    actions$ = inject(Actions),
    gymnasiumService = inject(GymnasiumService),
  ) => {
    return actions$.pipe(
      ofType(GymnasiumActions.loadPublicSessions),
      exhaustMap((action) =>
        gymnasiumService.findPublicSessions(action.limit).pipe(
          map((sessions: Session[]) =>
            GymnasiumActions.loadPublicSessionsSuccess({ sessions }),
          ),
          catchError((error) =>
            of(
              GymnasiumActions.loadPublicSessionsFailure({
                error: formatErrorMessage(error),
              }),
            ),
          ),
        ),
      ),
    );
  },
  { functional: true },
);

export const loadSession = createEffect(
  (
    actions$ = inject(Actions),
    gymnasiumService = inject(GymnasiumService),
  ) => {
    return actions$.pipe(
      ofType(GymnasiumActions.loadSession),
      exhaustMap((action) =>
        gymnasiumService.findSessionById(action.sessionId).pipe(
          map((session: Session) =>
            GymnasiumActions.loadSessionSuccess({ session }),
          ),
          catchError((error) =>
            of(
              GymnasiumActions.loadSessionFailure({
                error: formatErrorMessage(error),
              }),
            ),
          ),
        ),
      ),
    );
  },
  { functional: true },
);

export const loadSessionBySlug = createEffect(
  (
    actions$ = inject(Actions),
    gymnasiumService = inject(GymnasiumService),
  ) => {
    return actions$.pipe(
      ofType(GymnasiumActions.loadSessionBySlug),
      exhaustMap((action) =>
        gymnasiumService.findSessionBySlug(action.slug).pipe(
          map((session: Session) =>
            GymnasiumActions.loadSessionBySlugSuccess({ session }),
          ),
          catchError((error) =>
            of(
              GymnasiumActions.loadSessionBySlugFailure({
                error: formatErrorMessage(error),
              }),
            ),
          ),
        ),
      ),
    );
  },
  { functional: true },
);

export const renderSessionBySlug = createEffect(
  (
    actions$ = inject(Actions),
    gymnasiumService = inject(GymnasiumService),
  ) => {
    return actions$.pipe(
      ofType(GymnasiumActions.renderSessionBySlug),
      exhaustMap((action) =>
        gymnasiumService.renderSessionBySlug(action.slug, action.templateId).pipe(
          map((html: string) =>
            GymnasiumActions.renderSessionBySlugSuccess({
              slug: action.slug,
              html,
            }),
          ),
          catchError((error) =>
            of(
              GymnasiumActions.renderSessionBySlugFailure({
                error: formatErrorMessage(error),
              }),
            ),
          ),
        ),
      ),
    );
  },
  { functional: true },
);

export const renderSession = createEffect(
  (
    actions$ = inject(Actions),
    gymnasiumService = inject(GymnasiumService),
  ) => {
    return actions$.pipe(
      ofType(GymnasiumActions.renderSession),
      exhaustMap((action) =>
        gymnasiumService.renderSession(action.sessionId, action.templateId).pipe(
          map((html: string) =>
            GymnasiumActions.renderSessionSuccess({
              sessionId: action.sessionId,
              html,
            }),
          ),
          catchError((error) =>
            of(
              GymnasiumActions.renderSessionFailure({
                error: formatErrorMessage(error),
              }),
            ),
          ),
        ),
      ),
    );
  },
  { functional: true },
);

export const createSession = createEffect(
  (
    actions$ = inject(Actions),
    gymnasiumService = inject(GymnasiumService),
  ) => {
    return actions$.pipe(
      ofType(GymnasiumActions.createSession),
      exhaustMap((action) =>
        gymnasiumService.createSession(action.session as any).pipe(
          map((session: Session) =>
            GymnasiumActions.createSessionSuccess({ session }),
          ),
          catchError((error) =>
            of(
              GymnasiumActions.createSessionFailure({
                error: formatErrorMessage(error),
              }),
            ),
          ),
        ),
      ),
    );
  },
  { functional: true },
);

export const updateSession = createEffect(
  (
    actions$ = inject(Actions),
    gymnasiumService = inject(GymnasiumService),
  ) => {
    return actions$.pipe(
      ofType(GymnasiumActions.updateSession),
      exhaustMap((action) =>
        gymnasiumService.updateSession(action.id, action.changes).pipe(
          map((session: Session) =>
            GymnasiumActions.updateSessionSuccess({ session }),
          ),
          catchError((error) =>
            of(
              GymnasiumActions.updateSessionFailure({
                error: formatErrorMessage(error),
              }),
            ),
          ),
        ),
      ),
    );
  },
  { functional: true },
);

export const deleteSession = createEffect(
  (
    actions$ = inject(Actions),
    gymnasiumService = inject(GymnasiumService),
  ) => {
    return actions$.pipe(
      ofType(GymnasiumActions.deleteSession),
      exhaustMap((action) =>
        gymnasiumService.deleteSession(action.session.id).pipe(
          map(() =>
            GymnasiumActions.deleteSessionSuccess({ session: action.session }),
          ),
          catchError((error) =>
            of(
              GymnasiumActions.deleteSessionFailure({
                error: formatErrorMessage(error),
              }),
            ),
          ),
        ),
      ),
    );
  },
  { functional: true },
);

export const publishSession = createEffect(
  (
    actions$ = inject(Actions),
    gymnasiumService = inject(GymnasiumService),
  ) => {
    return actions$.pipe(
      ofType(GymnasiumActions.publishSession),
      exhaustMap((action) =>
        gymnasiumService.publishSession(action.sessionId).pipe(
          map((session: Session) =>
            GymnasiumActions.publishSessionSuccess({ session }),
          ),
          catchError((error) =>
            of(
              GymnasiumActions.publishSessionFailure({
                error: formatErrorMessage(error),
              }),
            ),
          ),
        ),
      ),
    );
  },
  { functional: true },
);

export const unpublishSession = createEffect(
  (
    actions$ = inject(Actions),
    gymnasiumService = inject(GymnasiumService),
  ) => {
    return actions$.pipe(
      ofType(GymnasiumActions.unpublishSession),
      exhaustMap((action) =>
        gymnasiumService.unpublishSession(action.sessionId).pipe(
          map((session: Session) =>
            GymnasiumActions.unpublishSessionSuccess({ session }),
          ),
          catchError((error) =>
            of(
              GymnasiumActions.unpublishSessionFailure({
                error: formatErrorMessage(error),
              }),
            ),
          ),
        ),
      ),
    );
  },
  { functional: true },
);

export const generateSession = createEffect(
  (
    actions$ = inject(Actions),
    gymnasiumService = inject(GymnasiumService),
  ) => {
    return actions$.pipe(
      ofType(GymnasiumActions.generateSession),
      exhaustMap((action) =>
        gymnasiumService.generateSession(action.dto).pipe(
          map((session: Session) =>
            GymnasiumActions.generateSessionSuccess({ session }),
          ),
          catchError((error) =>
            of(
              GymnasiumActions.generateSessionFailure({
                error: formatErrorMessage(error),
              }),
            ),
          ),
        ),
      ),
    );
  },
  { functional: true },
);

export const loadTemplates = createEffect(
  (
    actions$ = inject(Actions),
    gymnasiumService = inject(GymnasiumService),
  ) => {
    return actions$.pipe(
      ofType(GymnasiumActions.loadTemplates),
      exhaustMap(() =>
        gymnasiumService.findAllTemplates().pipe(
          map((templates: SessionTemplate[]) =>
            GymnasiumActions.loadTemplatesSuccess({ templates }),
          ),
          catchError((error) =>
            of(
              GymnasiumActions.loadTemplatesFailure({
                error: formatErrorMessage(error),
              }),
            ),
          ),
        ),
      ),
    );
  },
  { functional: true },
);

export const loadDefaultTemplate = createEffect(
  (
    actions$ = inject(Actions),
    gymnasiumService = inject(GymnasiumService),
  ) => {
    return actions$.pipe(
      ofType(GymnasiumActions.loadDefaultTemplate),
      exhaustMap(() =>
        gymnasiumService.getDefaultTemplate().pipe(
          map((template: SessionTemplate) =>
            GymnasiumActions.loadDefaultTemplateSuccess({ template }),
          ),
          catchError((error) =>
            of(
              GymnasiumActions.loadDefaultTemplateFailure({
                error: formatErrorMessage(error),
              }),
            ),
          ),
        ),
      ),
    );
  },
  { functional: true },
);
