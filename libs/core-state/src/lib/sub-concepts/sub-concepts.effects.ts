import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { SubConcept } from '@kasita/common-models';
import { SubConceptsService, LearningMapService, formatErrorMessage } from '@kasita/core-data';
import { of } from 'rxjs';
import { catchError, exhaustMap, map } from 'rxjs/operators';
import { SubConceptsActions } from './sub-concepts.actions';

export const loadSubConcepts = createEffect(
  (
    actions$ = inject(Actions),
    subConceptsService = inject(SubConceptsService),
  ) => {
    return actions$.pipe(
      ofType(SubConceptsActions.loadSubConcepts),
      exhaustMap(() =>
        subConceptsService.all().pipe(
          map((subConcepts: SubConcept[]) =>
            SubConceptsActions.loadSubConceptsSuccess({ subConcepts }),
          ),
          catchError((error) =>
            of(
              SubConceptsActions.loadSubConceptsFailure({
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

export const loadSubConcept = createEffect(
  (
    actions$ = inject(Actions),
    subConceptsService = inject(SubConceptsService),
  ) => {
    return actions$.pipe(
      ofType(SubConceptsActions.loadSubConcept),
      exhaustMap((action) => {
        return subConceptsService.find(action.subConceptId).pipe(
          map((subConcept: SubConcept) =>
            SubConceptsActions.loadSubConceptSuccess({ subConcept }),
          ),
          catchError((error) =>
            of(
              SubConceptsActions.loadSubConceptFailure({
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

export const loadSubConceptsByConcept = createEffect(
  (
    actions$ = inject(Actions),
    subConceptsService = inject(SubConceptsService),
  ) => {
    return actions$.pipe(
      ofType(SubConceptsActions.loadSubConceptsByConcept),
      exhaustMap((action) => {
        return subConceptsService.findByConcept(action.conceptId).pipe(
          map((subConcepts: SubConcept[]) =>
            SubConceptsActions.loadSubConceptsByConceptSuccess({ subConcepts }),
          ),
          catchError((error) =>
            of(
              SubConceptsActions.loadSubConceptsByConceptFailure({
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

export const createSubConcept = createEffect(
  (
    actions$ = inject(Actions),
    subConceptsService = inject(SubConceptsService),
  ) => {
    return actions$.pipe(
      ofType(SubConceptsActions.createSubConcept),
      exhaustMap((action) => {
        return subConceptsService.create(action.subConcept).pipe(
          map((subConcept: any) =>
            SubConceptsActions.createSubConceptSuccess({ subConcept }),
          ),
          catchError((error) =>
            of(
              SubConceptsActions.createSubConceptFailure({
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

export const updateSubConcept = createEffect(
  (
    actions$ = inject(Actions),
    subConceptsService = inject(SubConceptsService),
  ) => {
    return actions$.pipe(
      ofType(SubConceptsActions.updateSubConcept),
      exhaustMap((action) => {
        return subConceptsService.update(action.subConcept).pipe(
          map((subConcept: any) =>
            SubConceptsActions.updateSubConceptSuccess({ subConcept }),
          ),
          catchError((error) =>
            of(
              SubConceptsActions.updateSubConceptFailure({
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

export const deleteSubConcept = createEffect(
  (
    actions$ = inject(Actions),
    subConceptsService = inject(SubConceptsService),
  ) => {
    return actions$.pipe(
      ofType(SubConceptsActions.deleteSubConcept),
      exhaustMap((action) => {
        return subConceptsService.delete(action.subConcept).pipe(
          map(() =>
            SubConceptsActions.deleteSubConceptSuccess({ subConcept: action.subConcept }),
          ),
          catchError((error) =>
            of(
              SubConceptsActions.deleteSubConceptFailure({
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

// AI generation effects
export const decomposeConcept = createEffect(
  (
    actions$ = inject(Actions),
    learningMapService = inject(LearningMapService),
  ) => {
    return actions$.pipe(
      ofType(SubConceptsActions.decomposeConcept),
      exhaustMap((action) => {
        return learningMapService.decomposeConcept(action.conceptId).pipe(
          map((response: { subConcepts: SubConcept[]; message: string }) =>
            SubConceptsActions.decomposeConceptSuccess(response),
          ),
          catchError((error) =>
            of(
              SubConceptsActions.decomposeConceptFailure({
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

export const generateStructuredKU = createEffect(
  (
    actions$ = inject(Actions),
    learningMapService = inject(LearningMapService),
  ) => {
    return actions$.pipe(
      ofType(SubConceptsActions.generateStructuredKU),
      exhaustMap((action) => {
        return learningMapService.generateStructuredKU(action.subConceptId).pipe(
          map((response: any) =>
            SubConceptsActions.generateStructuredKUSuccess(response),
          ),
          catchError((error) =>
            of(
              SubConceptsActions.generateStructuredKUFailure({
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

// Decoration effects
export const addDecoration = createEffect(
  (
    actions$ = inject(Actions),
    subConceptsService = inject(SubConceptsService),
  ) => {
    return actions$.pipe(
      ofType(SubConceptsActions.addDecoration),
      exhaustMap((action) => {
        return subConceptsService.addDecoration(action.subConceptId, action.knowledgeUnitId).pipe(
          map(() =>
            SubConceptsActions.addDecorationSuccess({
              subConceptId: action.subConceptId,
              knowledgeUnitId: action.knowledgeUnitId,
            }),
          ),
          catchError((error) =>
            of(
              SubConceptsActions.addDecorationFailure({
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

export const removeDecoration = createEffect(
  (
    actions$ = inject(Actions),
    subConceptsService = inject(SubConceptsService),
  ) => {
    return actions$.pipe(
      ofType(SubConceptsActions.removeDecoration),
      exhaustMap((action) => {
        return subConceptsService.removeDecoration(action.subConceptId, action.knowledgeUnitId).pipe(
          map(() =>
            SubConceptsActions.removeDecorationSuccess({
              subConceptId: action.subConceptId,
              knowledgeUnitId: action.knowledgeUnitId,
            }),
          ),
          catchError((error) =>
            of(
              SubConceptsActions.removeDecorationFailure({
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
