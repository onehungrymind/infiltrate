import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Concept } from '@kasita/common-models';
import { ConceptsService, formatErrorMessage } from '@kasita/core-data';
import { of } from 'rxjs';
import { catchError, exhaustMap, map } from 'rxjs/operators';
import { ConceptsActions } from './concepts.actions';

export const loadConcepts = createEffect(
  (
    actions$ = inject(Actions),
    conceptsService = inject(ConceptsService),
  ) => {
    return actions$.pipe(
      ofType(ConceptsActions.loadConcepts),
      exhaustMap(() =>
        conceptsService.all().pipe(
          map((concepts: Concept[]) =>
            ConceptsActions.loadConceptsSuccess({ concepts }),
          ),
          catchError((error) =>
            of(
              ConceptsActions.loadConceptsFailure({
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

export const loadConcept = createEffect(
  (
    actions$ = inject(Actions),
    conceptsService = inject(ConceptsService),
  ) => {
    return actions$.pipe(
      ofType(ConceptsActions.loadConcept),
      exhaustMap((action) => {
        return conceptsService.find(action.conceptId).pipe(
          map((concept: Concept) =>
            ConceptsActions.loadConceptSuccess({ concept }),
          ),
          catchError((error) =>
            of(
              ConceptsActions.loadConceptFailure({
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

export const loadConceptsByPath = createEffect(
  (
    actions$ = inject(Actions),
    conceptsService = inject(ConceptsService),
  ) => {
    return actions$.pipe(
      ofType(ConceptsActions.loadConceptsByPath),
      exhaustMap((action) => {
        return conceptsService.findByPath(action.pathId).pipe(
          map((concepts: Concept[]) =>
            ConceptsActions.loadConceptsByPathSuccess({ concepts }),
          ),
          catchError((error) =>
            of(
              ConceptsActions.loadConceptsByPathFailure({
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

export const createConcept = createEffect(
  (
    actions$ = inject(Actions),
    conceptsService = inject(ConceptsService),
  ) => {
    return actions$.pipe(
      ofType(ConceptsActions.createConcept),
      exhaustMap((action) => {
        return conceptsService.create(action.concept).pipe(
          map((concept: any) =>
            ConceptsActions.createConceptSuccess({ concept }),
          ),
          catchError((error) =>
            of(
              ConceptsActions.createConceptFailure({
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

export const updateConcept = createEffect(
  (
    actions$ = inject(Actions),
    conceptsService = inject(ConceptsService),
  ) => {
    return actions$.pipe(
      ofType(ConceptsActions.updateConcept),
      exhaustMap((action) => {
        return conceptsService.update(action.concept).pipe(
          map((concept: any) =>
            ConceptsActions.updateConceptSuccess({ concept }),
          ),
          catchError((error) =>
            of(
              ConceptsActions.updateConceptFailure({
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

export const deleteConcept = createEffect(
  (
    actions$ = inject(Actions),
    conceptsService = inject(ConceptsService),
  ) => {
    return actions$.pipe(
      ofType(ConceptsActions.deleteConcept),
      exhaustMap((action) => {
        return conceptsService.delete(action.concept).pipe(
          map(() =>
            ConceptsActions.deleteConceptSuccess({ concept: action.concept }),
          ),
          catchError((error) =>
            of(
              ConceptsActions.deleteConceptFailure({
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
