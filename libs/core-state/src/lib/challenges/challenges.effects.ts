import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Challenge } from '@kasita/common-models';
import { ChallengesService, formatErrorMessage } from '@kasita/core-data';
import { of } from 'rxjs';
import { catchError, exhaustMap, map } from 'rxjs/operators';
import { ChallengesActions } from './challenges.actions';

export const loadChallenges = createEffect(
  (
    actions$ = inject(Actions),
    challengesService = inject(ChallengesService),
  ) => {
    return actions$.pipe(
      ofType(ChallengesActions.loadChallenges),
      exhaustMap(() =>
        challengesService.all().pipe(
          map((challenges: Challenge[]) =>
            ChallengesActions.loadChallengesSuccess({ challenges }),
          ),
          catchError((error) =>
            of(
              ChallengesActions.loadChallengesFailure({
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

export const loadChallenge = createEffect(
  (
    actions$ = inject(Actions),
    challengesService = inject(ChallengesService),
  ) => {
    return actions$.pipe(
      ofType(ChallengesActions.loadChallenge),
      exhaustMap((action) => {
        return challengesService.find(action.challengeId).pipe(
          map((challenge: Challenge) =>
            ChallengesActions.loadChallengeSuccess({ challenge }),
          ),
          catchError((error) =>
            of(
              ChallengesActions.loadChallengeFailure({
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

export const loadChallengesByUnit = createEffect(
  (
    actions$ = inject(Actions),
    challengesService = inject(ChallengesService),
  ) => {
    return actions$.pipe(
      ofType(ChallengesActions.loadChallengesByUnit),
      exhaustMap((action) => {
        return challengesService.findByUnit(action.unitId).pipe(
          map((challenges: Challenge[]) =>
            ChallengesActions.loadChallengesByUnitSuccess({ challenges }),
          ),
          catchError((error) =>
            of(
              ChallengesActions.loadChallengesByUnitFailure({
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

export const createChallenge = createEffect(
  (
    actions$ = inject(Actions),
    challengesService = inject(ChallengesService),
  ) => {
    return actions$.pipe(
      ofType(ChallengesActions.createChallenge),
      exhaustMap((action) => {
        return challengesService.create(action.challenge).pipe(
          map((challenge: Challenge) =>
            ChallengesActions.createChallengeSuccess({ challenge }),
          ),
          catchError((error) =>
            of(
              ChallengesActions.createChallengeFailure({
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

export const updateChallenge = createEffect(
  (
    actions$ = inject(Actions),
    challengesService = inject(ChallengesService),
  ) => {
    return actions$.pipe(
      ofType(ChallengesActions.updateChallenge),
      exhaustMap((action) => {
        return challengesService.update(action.challenge).pipe(
          map((challenge: Challenge) =>
            ChallengesActions.updateChallengeSuccess({ challenge }),
          ),
          catchError((error) =>
            of(
              ChallengesActions.updateChallengeFailure({
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

export const deleteChallenge = createEffect(
  (
    actions$ = inject(Actions),
    challengesService = inject(ChallengesService),
  ) => {
    return actions$.pipe(
      ofType(ChallengesActions.deleteChallenge),
      exhaustMap((action) => {
        return challengesService.delete(action.challenge).pipe(
          map(() =>
            ChallengesActions.deleteChallengeSuccess({
              challenge: action.challenge,
            }),
          ),
          catchError((error) =>
            of(
              ChallengesActions.deleteChallengeFailure({
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
