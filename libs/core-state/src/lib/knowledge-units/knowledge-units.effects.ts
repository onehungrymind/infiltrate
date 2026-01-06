import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { KnowledgeUnit } from '@kasita/common-models';
import { KnowledgeUnitService } from '@kasita/core-data';
import { of } from 'rxjs';
import { catchError, exhaustMap, map } from 'rxjs/operators';
import { KnowledgeUnitsActions } from './knowledge-units.actions';

export const loadKnowledgeUnits = createEffect(
  (
    actions$ = inject(Actions),
    knowledgeUnitsService = inject(KnowledgeUnitService),
  ) => {
    return actions$.pipe(
      ofType(KnowledgeUnitsActions.loadKnowledgeUnits),
      exhaustMap(() =>
        knowledgeUnitsService.all().pipe(
          map((knowledgeUnits: KnowledgeUnit[]) =>
            KnowledgeUnitsActions.loadKnowledgeUnitsSuccess({ knowledgeUnits }),
          ),
          catchError((error) =>
            of(
              KnowledgeUnitsActions.loadKnowledgeUnitsFailure({
                error: error?.message || 'Failed to load knowledgeUnits',
              }),
            ),
          ),
        ),
      ),
    );
  },
  { functional: true },
);

export const loadKnowledgeUnit = createEffect(
  (
    actions$ = inject(Actions),
    knowledgeUnitsService = inject(KnowledgeUnitService),
  ) => {
    return actions$.pipe(
      ofType(KnowledgeUnitsActions.loadKnowledgeUnit),
      exhaustMap((action) => {
        return knowledgeUnitsService.find(action.knowledgeUnitId).pipe(
          map((knowledgeUnit: KnowledgeUnit) =>
            KnowledgeUnitsActions.loadKnowledgeUnitSuccess({ knowledgeUnit }),
          ),
          catchError((error) =>
            of(
              KnowledgeUnitsActions.loadKnowledgeUnitFailure({
                error: error?.message || 'Failed to load knowledgeUnit',
              }),
            ),
          ),
        );
      }),
    );
  },
  { functional: true },
);

export const createKnowledgeUnit = createEffect(
  (
    actions$ = inject(Actions),
    knowledgeUnitsService = inject(KnowledgeUnitService),
  ) => {
    return actions$.pipe(
      ofType(KnowledgeUnitsActions.createKnowledgeUnit),
      exhaustMap((action) => {
        return knowledgeUnitsService.create(action.knowledgeUnit).pipe(
          map((knowledgeUnit: any) =>
            KnowledgeUnitsActions.createKnowledgeUnitSuccess({ knowledgeUnit }),
          ),
          catchError((error) =>
            of(
              KnowledgeUnitsActions.createKnowledgeUnitFailure({
                error: error?.message || 'Failed to create knowledgeUnit',
              }),
            ),
          ),
        );
      }),
    );
  },
  { functional: true },
);

export const updateKnowledgeUnit = createEffect(
  (
    actions$ = inject(Actions),
    knowledgeUnitsService = inject(KnowledgeUnitService),
  ) => {
    return actions$.pipe(
      ofType(KnowledgeUnitsActions.updateKnowledgeUnit),
      exhaustMap((action) => {
        return knowledgeUnitsService.update(action.knowledgeUnit).pipe(
          map((knowledgeUnit: any) =>
            KnowledgeUnitsActions.updateKnowledgeUnitSuccess({ knowledgeUnit }),
          ),
          catchError((error) =>
            of(
              KnowledgeUnitsActions.updateKnowledgeUnitFailure({
                error: error?.message || 'Failed to update knowledgeUnit',
              }),
            ),
          ),
        );
      }),
    );
  },
  { functional: true },
);

export const deleteKnowledgeUnit = createEffect(
  (
    actions$ = inject(Actions),
    knowledgeUnitsService = inject(KnowledgeUnitService),
  ) => {
    return actions$.pipe(
      ofType(KnowledgeUnitsActions.deleteKnowledgeUnit),
      exhaustMap((action) => {
        return knowledgeUnitsService.delete(action.knowledgeUnit).pipe(
          map((knowledgeUnit: any) =>
            KnowledgeUnitsActions.deleteKnowledgeUnitSuccess({ knowledgeUnit }),
          ),
          catchError((error) =>
            of(
              KnowledgeUnitsActions.deleteKnowledgeUnitFailure({
                error: error?.message || 'Failed to delete knowledgeUnit',
              }),
            ),
          ),
        );
      }),
    );
  },
  { functional: true },
);
