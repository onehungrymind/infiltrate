import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { SourceConfig } from '@kasita/common-models';
import { SourceConfigService } from '@kasita/core-data';
import { of } from 'rxjs';
import { catchError, exhaustMap, map } from 'rxjs/operators';
import { SourceConfigsActions } from './source-configs.actions';

export const loadSourceConfigs = createEffect(
  (
    actions$ = inject(Actions),
    sourceConfigsService = inject(SourceConfigService),
  ) => {
    return actions$.pipe(
      ofType(SourceConfigsActions.loadSourceConfigs),
      exhaustMap(() =>
        sourceConfigsService.all().pipe(
          map((sourceConfigs: SourceConfig[]) =>
            SourceConfigsActions.loadSourceConfigsSuccess({ sourceConfigs }),
          ),
          catchError((error) =>
            of(
              SourceConfigsActions.loadSourceConfigsFailure({
                error: error?.message || 'Failed to load sourceConfigs',
              }),
            ),
          ),
        ),
      ),
    );
  },
  { functional: true },
);

export const loadSourceConfig = createEffect(
  (
    actions$ = inject(Actions),
    sourceConfigsService = inject(SourceConfigService),
  ) => {
    return actions$.pipe(
      ofType(SourceConfigsActions.loadSourceConfig),
      exhaustMap((action) => {
        return sourceConfigsService.find(action.sourceConfigId).pipe(
          map((sourceConfig: SourceConfig) =>
            SourceConfigsActions.loadSourceConfigSuccess({ sourceConfig }),
          ),
          catchError((error) =>
            of(
              SourceConfigsActions.loadSourceConfigFailure({
                error: error?.message || 'Failed to load sourceConfig',
              }),
            ),
          ),
        );
      }),
    );
  },
  { functional: true },
);

export const createSourceConfig = createEffect(
  (
    actions$ = inject(Actions),
    sourceConfigsService = inject(SourceConfigService),
  ) => {
    return actions$.pipe(
      ofType(SourceConfigsActions.createSourceConfig),
      exhaustMap((action) => {
        return sourceConfigsService.create(action.sourceConfig).pipe(
          map((sourceConfig: any) =>
            SourceConfigsActions.createSourceConfigSuccess({ sourceConfig }),
          ),
          catchError((error) =>
            of(
              SourceConfigsActions.createSourceConfigFailure({
                error: error?.message || 'Failed to create sourceConfig',
              }),
            ),
          ),
        );
      }),
    );
  },
  { functional: true },
);

export const updateSourceConfig = createEffect(
  (
    actions$ = inject(Actions),
    sourceConfigsService = inject(SourceConfigService),
  ) => {
    return actions$.pipe(
      ofType(SourceConfigsActions.updateSourceConfig),
      exhaustMap((action) => {
        return sourceConfigsService.update(action.sourceConfig).pipe(
          map((sourceConfig: any) =>
            SourceConfigsActions.updateSourceConfigSuccess({ sourceConfig }),
          ),
          catchError((error) =>
            of(
              SourceConfigsActions.updateSourceConfigFailure({
                error: error?.message || 'Failed to update sourceConfig',
              }),
            ),
          ),
        );
      }),
    );
  },
  { functional: true },
);

export const deleteSourceConfig = createEffect(
  (
    actions$ = inject(Actions),
    sourceConfigsService = inject(SourceConfigService),
  ) => {
    return actions$.pipe(
      ofType(SourceConfigsActions.deleteSourceConfig),
      exhaustMap((action) => {
        return sourceConfigsService.delete(action.sourceConfig).pipe(
          map((sourceConfig: any) =>
            SourceConfigsActions.deleteSourceConfigSuccess({ sourceConfig }),
          ),
          catchError((error) =>
            of(
              SourceConfigsActions.deleteSourceConfigFailure({
                error: error?.message || 'Failed to delete sourceConfig',
              }),
            ),
          ),
        );
      }),
    );
  },
  { functional: true },
);
