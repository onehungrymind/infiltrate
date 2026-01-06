import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { DataSource } from '@kasita/common-models';
import { DataSourcesService, formatErrorMessage } from '@kasita/core-data';
import { of } from 'rxjs';
import { catchError, exhaustMap, map } from 'rxjs/operators';
import { DataSourcesActions } from './data-sources.actions';

export const loadDataSources = createEffect(
  (
    actions$ = inject(Actions),
    dataSourcesService = inject(DataSourcesService),
  ) => {
    return actions$.pipe(
      ofType(DataSourcesActions.loadDataSources),
      exhaustMap(() =>
        dataSourcesService.all().pipe(
          map((dataSources: DataSource[]) =>
            DataSourcesActions.loadDataSourcesSuccess({ dataSources }),
          ),
          catchError((error) =>
            of(
              DataSourcesActions.loadDataSourcesFailure({
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

export const loadDataSource = createEffect(
  (
    actions$ = inject(Actions),
    dataSourcesService = inject(DataSourcesService),
  ) => {
    return actions$.pipe(
      ofType(DataSourcesActions.loadDataSource),
      exhaustMap((action) => {
        return dataSourcesService.find(action.dataSourceId).pipe(
          map((dataSource: DataSource) =>
            DataSourcesActions.loadDataSourceSuccess({ dataSource }),
          ),
          catchError((error) =>
            of(
              DataSourcesActions.loadDataSourceFailure({
                error: formatErrorMessage(error),
              }),
            ),
          ),
        );
      }),
    );
  },
  { functional: true },
);

export const createDataSource = createEffect(
  (
    actions$ = inject(Actions),
    dataSourcesService = inject(DataSourcesService),
  ) => {
    return actions$.pipe(
      ofType(DataSourcesActions.createDataSource),
      exhaustMap((action) => {
        return dataSourcesService.create(action.dataSource).pipe(
          map((dataSource: any) =>
            DataSourcesActions.createDataSourceSuccess({ dataSource }),
          ),
          catchError((error) =>
            of(
              DataSourcesActions.createDataSourceFailure({
                error: formatErrorMessage(error),
              }),
            ),
          ),
        );
      }),
    );
  },
  { functional: true },
);

export const updateDataSource = createEffect(
  (
    actions$ = inject(Actions),
    dataSourcesService = inject(DataSourcesService),
  ) => {
    return actions$.pipe(
      ofType(DataSourcesActions.updateDataSource),
      exhaustMap((action) => {
        return dataSourcesService.update(action.dataSource).pipe(
          map((dataSource: any) =>
            DataSourcesActions.updateDataSourceSuccess({ dataSource }),
          ),
          catchError((error) =>
            of(
              DataSourcesActions.updateDataSourceFailure({
                error: formatErrorMessage(error),
              }),
            ),
          ),
        );
      }),
    );
  },
  { functional: true },
);

export const deleteDataSource = createEffect(
  (
    actions$ = inject(Actions),
    dataSourcesService = inject(DataSourcesService),
  ) => {
    return actions$.pipe(
      ofType(DataSourcesActions.deleteDataSource),
      exhaustMap((action) => {
        return dataSourcesService.delete(action.dataSource).pipe(
          map((dataSource: any) =>
            DataSourcesActions.deleteDataSourceSuccess({ dataSource }),
          ),
          catchError((error) =>
            of(
              DataSourcesActions.deleteDataSourceFailure({
                error: formatErrorMessage(error),
              }),
            ),
          ),
        );
      }),
    );
  },
  { functional: true },
);

