import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { RawContent } from '@kasita/common-models';
import { RawContentService } from '@kasita/core-data';
import { of } from 'rxjs';
import { catchError, exhaustMap, map } from 'rxjs/operators';
import { RawContentActions } from './raw-content.actions';

export const loadRawContent = createEffect(
  (
    actions$ = inject(Actions),
    rawContentService = inject(RawContentService),
  ) => {
    return actions$.pipe(
      ofType(RawContentActions.loadRawContent),
      exhaustMap(() =>
        rawContentService.all().pipe(
          map((rawContent: RawContent[]) =>
            RawContentActions.loadRawContentSuccess({ rawContent: rawContent }),
          ),
          catchError((error) =>
            of(
              RawContentActions.loadRawContentFailure({
                error: error?.message || 'Failed to load rawContent',
              }),
            ),
          ),
        ),
      ),
    );
  },
  { functional: true },
);

export const loadRawContentByPath = createEffect(
  (
    actions$ = inject(Actions),
    rawContentService = inject(RawContentService),
  ) => {
    return actions$.pipe(
      ofType(RawContentActions.loadRawContentByPath),
      exhaustMap((action) => {
        return rawContentService.findByPath(action.pathId).pipe(
          map((rawContent: RawContent[]) =>
            RawContentActions.loadRawContentByPathSuccess({ rawContent }),
          ),
          catchError((error) =>
            of(
              RawContentActions.loadRawContentByPathFailure({
                error: error?.message || 'Failed to load raw content by path',
              }),
            ),
          ),
        );
      }),
    );
  },
  { functional: true },
);

export const loadRawContentItem = createEffect(
  (
    actions$ = inject(Actions),
    rawContentService = inject(RawContentService),
  ) => {
    return actions$.pipe(
      ofType(RawContentActions.loadRawContentItem),
      exhaustMap((action) => {
        return rawContentService.find(action.rawContentId).pipe(
          map((rawContent: RawContent) =>
            RawContentActions.loadRawContentItemSuccess({ rawContent }),
          ),
          catchError((error) =>
            of(
              RawContentActions.loadRawContentItemFailure({
                error: error?.message || 'Failed to load rawContent',
              }),
            ),
          ),
        );
      }),
    );
  },
  { functional: true },
);

export const createRawContent = createEffect(
  (
    actions$ = inject(Actions),
    rawContentService = inject(RawContentService),
  ) => {
    return actions$.pipe(
      ofType(RawContentActions.createRawContent),
      exhaustMap((action) => {
        return rawContentService.create(action.rawContent).pipe(
          map((rawContent: any) =>
            RawContentActions.createRawContentSuccess({ rawContent }),
          ),
          catchError((error) =>
            of(
              RawContentActions.createRawContentFailure({
                error: error?.message || 'Failed to create rawContent',
              }),
            ),
          ),
        );
      }),
    );
  },
  { functional: true },
);

export const updateRawContent = createEffect(
  (
    actions$ = inject(Actions),
    rawContentService = inject(RawContentService),
  ) => {
    return actions$.pipe(
      ofType(RawContentActions.updateRawContent),
      exhaustMap((action) => {
        return rawContentService.update(action.rawContent).pipe(
          map((rawContent: any) =>
            RawContentActions.updateRawContentSuccess({ rawContent }),
          ),
          catchError((error) =>
            of(
              RawContentActions.updateRawContentFailure({
                error: error?.message || 'Failed to update rawContent',
              }),
            ),
          ),
        );
      }),
    );
  },
  { functional: true },
);

export const deleteRawContent = createEffect(
  (
    actions$ = inject(Actions),
    rawContentService = inject(RawContentService),
  ) => {
    return actions$.pipe(
      ofType(RawContentActions.deleteRawContent),
      exhaustMap((action) => {
        return rawContentService.delete(action.rawContent).pipe(
          map((rawContent: any) =>
            RawContentActions.deleteRawContentSuccess({ rawContent }),
          ),
          catchError((error) =>
            of(
              RawContentActions.deleteRawContentFailure({
                error: error?.message || 'Failed to delete rawContent',
              }),
            ),
          ),
        );
      }),
    );
  },
  { functional: true },
);
