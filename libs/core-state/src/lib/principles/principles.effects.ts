import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Principle } from '@kasita/common-models';
import { PrinciplesService, formatErrorMessage } from '@kasita/core-data';
import { of } from 'rxjs';
import { catchError, exhaustMap, map } from 'rxjs/operators';
import { PrinciplesActions } from './principles.actions';

export const loadPrinciples = createEffect(
  (
    actions$ = inject(Actions),
    principlesService = inject(PrinciplesService),
  ) => {
    return actions$.pipe(
      ofType(PrinciplesActions.loadPrinciples),
      exhaustMap(() =>
        principlesService.all().pipe(
          map((principles: Principle[]) =>
            PrinciplesActions.loadPrinciplesSuccess({ principles }),
          ),
          catchError((error) =>
            of(
              PrinciplesActions.loadPrinciplesFailure({
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

export const loadPrinciple = createEffect(
  (
    actions$ = inject(Actions),
    principlesService = inject(PrinciplesService),
  ) => {
    return actions$.pipe(
      ofType(PrinciplesActions.loadPrinciple),
      exhaustMap((action) => {
        return principlesService.find(action.principleId).pipe(
          map((principle: Principle) =>
            PrinciplesActions.loadPrincipleSuccess({ principle }),
          ),
          catchError((error) =>
            of(
              PrinciplesActions.loadPrincipleFailure({
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

export const loadPrinciplesByPath = createEffect(
  (
    actions$ = inject(Actions),
    principlesService = inject(PrinciplesService),
  ) => {
    return actions$.pipe(
      ofType(PrinciplesActions.loadPrinciplesByPath),
      exhaustMap((action) => {
        return principlesService.findByPath(action.pathId).pipe(
          map((principles: Principle[]) =>
            PrinciplesActions.loadPrinciplesByPathSuccess({ principles }),
          ),
          catchError((error) =>
            of(
              PrinciplesActions.loadPrinciplesByPathFailure({
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

export const createPrinciple = createEffect(
  (
    actions$ = inject(Actions),
    principlesService = inject(PrinciplesService),
  ) => {
    return actions$.pipe(
      ofType(PrinciplesActions.createPrinciple),
      exhaustMap((action) => {
        return principlesService.create(action.principle).pipe(
          map((principle: any) =>
            PrinciplesActions.createPrincipleSuccess({ principle }),
          ),
          catchError((error) =>
            of(
              PrinciplesActions.createPrincipleFailure({
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

export const updatePrinciple = createEffect(
  (
    actions$ = inject(Actions),
    principlesService = inject(PrinciplesService),
  ) => {
    return actions$.pipe(
      ofType(PrinciplesActions.updatePrinciple),
      exhaustMap((action) => {
        return principlesService.update(action.principle).pipe(
          map((principle: any) =>
            PrinciplesActions.updatePrincipleSuccess({ principle }),
          ),
          catchError((error) =>
            of(
              PrinciplesActions.updatePrincipleFailure({
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

export const deletePrinciple = createEffect(
  (
    actions$ = inject(Actions),
    principlesService = inject(PrinciplesService),
  ) => {
    return actions$.pipe(
      ofType(PrinciplesActions.deletePrinciple),
      exhaustMap((action) => {
        return principlesService.delete(action.principle).pipe(
          map(() =>
            PrinciplesActions.deletePrincipleSuccess({ principle: action.principle }),
          ),
          catchError((error) =>
            of(
              PrinciplesActions.deletePrincipleFailure({
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
