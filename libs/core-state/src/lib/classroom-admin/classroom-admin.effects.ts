import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ClassroomAdminService, formatErrorMessage } from '@kasita/core-data';
import { of } from 'rxjs';
import { catchError, exhaustMap, map } from 'rxjs/operators';
import { ClassroomAdminActions } from './classroom-admin.actions';

export const loadOverview = createEffect(
  (
    actions$ = inject(Actions),
    service = inject(ClassroomAdminService),
  ) => {
    return actions$.pipe(
      ofType(ClassroomAdminActions.loadOverview),
      exhaustMap(() =>
        service.getOverview().pipe(
          map((overview) =>
            ClassroomAdminActions.loadOverviewSuccess({ overview }),
          ),
          catchError((error) =>
            of(ClassroomAdminActions.loadOverviewFailure({ error: formatErrorMessage(error) })),
          ),
        ),
      ),
    );
  },
  { functional: true },
);

export const loadPathStatus = createEffect(
  (
    actions$ = inject(Actions),
    service = inject(ClassroomAdminService),
  ) => {
    return actions$.pipe(
      ofType(ClassroomAdminActions.loadPathStatus),
      exhaustMap((action) =>
        service.getPathStatus(action.learningPathId).pipe(
          map((pathStatus) =>
            ClassroomAdminActions.loadPathStatusSuccess({ pathStatus }),
          ),
          catchError((error) =>
            of(ClassroomAdminActions.loadPathStatusFailure({ error: formatErrorMessage(error) })),
          ),
        ),
      ),
    );
  },
  { functional: true },
);

export const loadContentList = createEffect(
  (
    actions$ = inject(Actions),
    service = inject(ClassroomAdminService),
  ) => {
    return actions$.pipe(
      ofType(ClassroomAdminActions.loadContentList),
      exhaustMap((action) =>
        service.getContentList(action.query || {}).pipe(
          map((response) =>
            ClassroomAdminActions.loadContentListSuccess({ response }),
          ),
          catchError((error) =>
            of(ClassroomAdminActions.loadContentListFailure({ error: formatErrorMessage(error) })),
          ),
        ),
      ),
    );
  },
  { functional: true },
);

export const loadContent = createEffect(
  (
    actions$ = inject(Actions),
    service = inject(ClassroomAdminService),
  ) => {
    return actions$.pipe(
      ofType(ClassroomAdminActions.loadContent),
      exhaustMap((action) =>
        service.getContent(action.contentId).pipe(
          map((content) =>
            ClassroomAdminActions.loadContentSuccess({ content }),
          ),
          catchError((error) =>
            of(ClassroomAdminActions.loadContentFailure({ error: formatErrorMessage(error) })),
          ),
        ),
      ),
    );
  },
  { functional: true },
);

export const loadErrors = createEffect(
  (
    actions$ = inject(Actions),
    service = inject(ClassroomAdminService),
  ) => {
    return actions$.pipe(
      ofType(ClassroomAdminActions.loadErrors),
      exhaustMap(() =>
        service.getErrors().pipe(
          map((errors) =>
            ClassroomAdminActions.loadErrorsSuccess({ errors }),
          ),
          catchError((error) =>
            of(ClassroomAdminActions.loadErrorsFailure({ error: formatErrorMessage(error) })),
          ),
        ),
      ),
    );
  },
  { functional: true },
);

export const generateForPath = createEffect(
  (
    actions$ = inject(Actions),
    service = inject(ClassroomAdminService),
  ) => {
    return actions$.pipe(
      ofType(ClassroomAdminActions.generateForPath),
      exhaustMap((action) =>
        service.generateForPath(action.learningPathId, action.force).pipe(
          map((response) =>
            ClassroomAdminActions.generateForPathSuccess({ response }),
          ),
          catchError((error) =>
            of(ClassroomAdminActions.generateForPathFailure({ error: formatErrorMessage(error) })),
          ),
        ),
      ),
    );
  },
  { functional: true },
);

export const generateForConcept = createEffect(
  (
    actions$ = inject(Actions),
    service = inject(ClassroomAdminService),
  ) => {
    return actions$.pipe(
      ofType(ClassroomAdminActions.generateForConcept),
      exhaustMap((action) =>
        service.generateForConcept(action.conceptId).pipe(
          map((response) =>
            ClassroomAdminActions.generateForConceptSuccess({ response }),
          ),
          catchError((error) =>
            of(ClassroomAdminActions.generateForConceptFailure({ error: formatErrorMessage(error) })),
          ),
        ),
      ),
    );
  },
  { functional: true },
);

export const generateForSubConcept = createEffect(
  (
    actions$ = inject(Actions),
    service = inject(ClassroomAdminService),
  ) => {
    return actions$.pipe(
      ofType(ClassroomAdminActions.generateForSubConcept),
      exhaustMap((action) =>
        service.generateForSubConcept(action.subConceptId, action.options || {}).pipe(
          map((response) =>
            ClassroomAdminActions.generateForSubConceptSuccess({ response }),
          ),
          catchError((error) =>
            of(ClassroomAdminActions.generateForSubConceptFailure({ error: formatErrorMessage(error) })),
          ),
        ),
      ),
    );
  },
  { functional: true },
);

export const clearPathContent = createEffect(
  (
    actions$ = inject(Actions),
    service = inject(ClassroomAdminService),
  ) => {
    return actions$.pipe(
      ofType(ClassroomAdminActions.clearPathContent),
      exhaustMap((action) =>
        service.clearPathContent(action.learningPathId).pipe(
          map((response) =>
            ClassroomAdminActions.clearPathContentSuccess({
              learningPathId: response.learningPathId,
              deletedCount: response.deletedCount,
            }),
          ),
          catchError((error) =>
            of(ClassroomAdminActions.clearPathContentFailure({ error: formatErrorMessage(error) })),
          ),
        ),
      ),
    );
  },
  { functional: true },
);

export const updateContent = createEffect(
  (
    actions$ = inject(Actions),
    service = inject(ClassroomAdminService),
  ) => {
    return actions$.pipe(
      ofType(ClassroomAdminActions.updateContent),
      exhaustMap((action) =>
        service.updateContent(action.contentId, action.updates).pipe(
          map((content) =>
            ClassroomAdminActions.updateContentSuccess({ content }),
          ),
          catchError((error) =>
            of(ClassroomAdminActions.updateContentFailure({ error: formatErrorMessage(error) })),
          ),
        ),
      ),
    );
  },
  { functional: true },
);

export const approveContent = createEffect(
  (
    actions$ = inject(Actions),
    service = inject(ClassroomAdminService),
  ) => {
    return actions$.pipe(
      ofType(ClassroomAdminActions.approveContent),
      exhaustMap((action) =>
        service.approveContent(action.contentId).pipe(
          map((content) =>
            ClassroomAdminActions.approveContentSuccess({ content }),
          ),
          catchError((error) =>
            of(ClassroomAdminActions.approveContentFailure({ error: formatErrorMessage(error) })),
          ),
        ),
      ),
    );
  },
  { functional: true },
);

export const regenerateContent = createEffect(
  (
    actions$ = inject(Actions),
    service = inject(ClassroomAdminService),
  ) => {
    return actions$.pipe(
      ofType(ClassroomAdminActions.regenerateContent),
      exhaustMap((action) =>
        service.regenerateContent(action.contentId).pipe(
          map((response) =>
            ClassroomAdminActions.regenerateContentSuccess({ response }),
          ),
          catchError((error) =>
            of(ClassroomAdminActions.regenerateContentFailure({ error: formatErrorMessage(error) })),
          ),
        ),
      ),
    );
  },
  { functional: true },
);

export const loadJobs = createEffect(
  (
    actions$ = inject(Actions),
    service = inject(ClassroomAdminService),
  ) => {
    return actions$.pipe(
      ofType(ClassroomAdminActions.loadJobs),
      exhaustMap(() =>
        service.getJobs().pipe(
          map((jobs) =>
            ClassroomAdminActions.loadJobsSuccess({ jobs }),
          ),
          catchError((error) =>
            of(ClassroomAdminActions.loadJobsFailure({ error: formatErrorMessage(error) })),
          ),
        ),
      ),
    );
  },
  { functional: true },
);

export const cancelJob = createEffect(
  (
    actions$ = inject(Actions),
    service = inject(ClassroomAdminService),
  ) => {
    return actions$.pipe(
      ofType(ClassroomAdminActions.cancelJob),
      exhaustMap((action) =>
        service.cancelJob(action.jobId).pipe(
          map(() =>
            ClassroomAdminActions.cancelJobSuccess({ jobId: action.jobId }),
          ),
          catchError((error) =>
            of(ClassroomAdminActions.cancelJobFailure({ error: formatErrorMessage(error) })),
          ),
        ),
      ),
    );
  },
  { functional: true },
);

// Reload overview after generation actions
export const reloadOverviewAfterGenerate = createEffect(
  (actions$ = inject(Actions)) => {
    return actions$.pipe(
      ofType(
        ClassroomAdminActions.generateForPathSuccess,
        ClassroomAdminActions.generateForConceptSuccess,
        ClassroomAdminActions.generateForSubConceptSuccess,
        ClassroomAdminActions.clearPathContentSuccess,
      ),
      map(() => ClassroomAdminActions.loadOverview()),
    );
  },
  { functional: true },
);

// Reload jobs after generation actions
export const reloadJobsAfterGenerate = createEffect(
  (actions$ = inject(Actions)) => {
    return actions$.pipe(
      ofType(
        ClassroomAdminActions.generateForPathSuccess,
        ClassroomAdminActions.generateForConceptSuccess,
        ClassroomAdminActions.generateForSubConceptSuccess,
        ClassroomAdminActions.regenerateContentSuccess,
        ClassroomAdminActions.cancelJobSuccess,
      ),
      map(() => ClassroomAdminActions.loadJobs()),
    );
  },
  { functional: true },
);
