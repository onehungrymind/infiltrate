import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { <%= singularClassName %> } from '<%= npmScope %>/api-interfaces';
import { <%= singularClassName %>Service } from '<%= npmScope %>/core-data';
import { of } from 'rxjs';
import { catchError, exhaustMap, map } from 'rxjs/operators';
import { <%= pluralClassName %>Actions } from './<%= featureName %>.actions';

export const load<%= pluralClassName %> = createEffect(
  (actions$ = inject(Actions), <%= pluralPropertyName %>Service = inject(<%= singularClassName %>Service)) => {
    return actions$.pipe(
      ofType(<%= pluralClassName %>Actions.load<%= pluralClassName %>),
      exhaustMap(() =>
        <%= pluralPropertyName %>Service.all().pipe(
          map((<%= pluralPropertyName %>: <%= singularClassName %>[]) =>
            <%= pluralClassName %>Actions.load<%= pluralClassName %>Success({ <%= pluralPropertyName %> })
          ),
          catchError((error) =>
            of(
              <%= pluralClassName %>Actions.load<%= pluralClassName %>Failure({
                error: error?.message || 'Failed to load <%= pluralPropertyName %>',
              })
            )
          )
        )
      )
    );
  },
  { functional: true }
);

export const load<%= singularClassName %> = createEffect(
  (actions$ = inject(Actions), <%= pluralPropertyName %>Service = inject(<%= singularClassName %>Service)) => {
    return actions$.pipe(
      ofType(<%= pluralClassName %>Actions.load<%= singularClassName %>),
      exhaustMap((action) => {
        return <%= pluralPropertyName %>Service.find(action.<%= singularPropertyName %>Id).pipe(
          map((<%= singularPropertyName %>: <%= singularClassName %>) =>
            <%= pluralClassName %>Actions.load<%= singularClassName %>Success({ <%= singularPropertyName %> })
          ),
          catchError((error) =>
            of(
              <%= pluralClassName %>Actions.load<%= singularClassName %>Failure({
                error: error?.message || 'Failed to load <%= singularPropertyName %>',
              })
            )
          )
        );
      })
    );
  },
  { functional: true }
);

export const create<%= singularClassName %> = createEffect(
  (actions$ = inject(Actions), <%= pluralPropertyName %>Service = inject(<%= singularClassName %>Service)) => {
    return actions$.pipe(
      ofType(<%= pluralClassName %>Actions.create<%= singularClassName %>),
      exhaustMap((action) => {
        return <%= pluralPropertyName %>Service.create(action.<%= singularPropertyName %>).pipe(
          map((<%= singularPropertyName %>: any) =>
            <%= pluralClassName %>Actions.create<%= singularClassName %>Success({ <%= singularPropertyName %> })
          ),
          catchError((error) =>
            of(
              <%= pluralClassName %>Actions.create<%= singularClassName %>Failure({
                error: error?.message || 'Failed to create <%= singularPropertyName %>',
              })
            )
          )
        );
      })
    );
  },
  { functional: true }
);

export const update<%= singularClassName %> = createEffect(
  (actions$ = inject(Actions), <%= pluralPropertyName %>Service = inject(<%= singularClassName %>Service)) => {
    return actions$.pipe(
      ofType(<%= pluralClassName %>Actions.update<%= singularClassName %>),
      exhaustMap((action) => {
        return <%= pluralPropertyName %>Service.update(action.<%= singularPropertyName %>).pipe(
          map((<%= singularPropertyName %>: any) =>
            <%= pluralClassName %>Actions.update<%= singularClassName %>Success({ <%= singularPropertyName %> })
          ),
          catchError((error) =>
            of(
              <%= pluralClassName %>Actions.update<%= singularClassName %>Failure({
                error: error?.message || 'Failed to update <%= singularPropertyName %>',
              })
            )
          )
        );
      })
    );
  },
  { functional: true }
);

export const delete<%= singularClassName %> = createEffect(
  (actions$ = inject(Actions), <%= pluralPropertyName %>Service = inject(<%= singularClassName %>Service)) => {
    return actions$.pipe(
      ofType(<%= pluralClassName %>Actions.delete<%= singularClassName %>),
      exhaustMap((action) => {
        return <%= pluralPropertyName %>Service.delete(action.<%= singularPropertyName %>).pipe(
          map((<%= singularPropertyName %>: any) =>
            <%= pluralClassName %>Actions.delete<%= singularClassName %>Success({ <%= singularPropertyName %> })
          ),
          catchError((error) =>
            of(
              <%= pluralClassName %>Actions.delete<%= singularClassName %>Failure({
                error: error?.message || 'Failed to delete <%= singularPropertyName %>',
              })
            )
          )
        );
      })
    );
  },
  { functional: true }
);
