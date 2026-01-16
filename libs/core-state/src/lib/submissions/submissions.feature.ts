import { createFeature, createReducer, on, createSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { Submission, Feedback } from '@kasita/common-models';
import { SubmissionsActions } from './submissions.actions';

export const SUBMISSIONS_FEATURE_KEY = 'submissions';

// --- State & Adapter ---
export interface SubmissionsState extends EntityState<Submission> {
  selectedId: string | null;
  error: string | null;
  loaded: boolean;
  feedbackBySubmissionId: Record<string, Feedback[]>;
  feedbackLoading: boolean;
  mentorSubmissions: Submission[];
  mentorSubmissionsLoaded: boolean;
}

export const submissionsAdapter: EntityAdapter<Submission> =
  createEntityAdapter<Submission>();

export const initialSubmissionsState: SubmissionsState =
  submissionsAdapter.getInitialState({
    selectedId: null,
    error: null,
    loaded: false,
    feedbackBySubmissionId: {},
    feedbackLoading: false,
    mentorSubmissions: [],
    mentorSubmissionsLoaded: false,
  });

// --- Helper Functions ---
const onFailure = (
  state: SubmissionsState,
  { error }: { error: string | null },
) => ({
  ...state,
  error,
});

const submissionsReducer = createReducer(
  initialSubmissionsState,

  // Load flags
  on(SubmissionsActions.loadSubmissions, (state) => ({
    ...state,
    loaded: false,
    error: null,
  })),
  on(SubmissionsActions.loadSubmission, (state) => ({
    ...state,
    loaded: false,
    error: null,
  })),
  on(SubmissionsActions.loadSubmissionsByUser, (state) => ({
    ...state,
    loaded: false,
    error: null,
  })),
  on(SubmissionsActions.loadSubmissionsByUnit, (state) => ({
    ...state,
    loaded: false,
    error: null,
  })),
  on(SubmissionsActions.loadSubmissionsByPath, (state) => ({
    ...state,
    loaded: false,
    error: null,
  })),

  // Selection / Reset
  on(SubmissionsActions.selectSubmission, (state, { selectedId }) => ({
    ...state,
    selectedId,
  })),
  on(SubmissionsActions.resetSelectedSubmission, (state) => ({
    ...state,
    selectedId: null,
  })),
  on(SubmissionsActions.resetSubmissions, (state) =>
    submissionsAdapter.removeAll({
      ...state,
      selectedId: null,
      loaded: false,
      feedbackBySubmissionId: {},
    }),
  ),

  // Load Success
  on(
    SubmissionsActions.loadSubmissionsSuccess,
    (state, { submissions }) =>
      submissionsAdapter.setAll(submissions, {
        ...state,
        loaded: true,
        error: null,
      }),
  ),
  on(
    SubmissionsActions.loadSubmissionsByUserSuccess,
    (state, { submissions }) =>
      submissionsAdapter.setAll(submissions, {
        ...state,
        loaded: true,
        error: null,
      }),
  ),
  on(
    SubmissionsActions.loadSubmissionsByUnitSuccess,
    (state, { submissions }) =>
      submissionsAdapter.setAll(submissions, {
        ...state,
        loaded: true,
        error: null,
      }),
  ),
  on(
    SubmissionsActions.loadSubmissionsByPathSuccess,
    (state, { submissions }) =>
      submissionsAdapter.setAll(submissions, {
        ...state,
        loaded: true,
        error: null,
      }),
  ),
  on(
    SubmissionsActions.loadSubmissionSuccess,
    (state, { submission }) =>
      submissionsAdapter.upsertOne(submission, {
        ...state,
        loaded: true,
        error: null,
      }),
  ),

  // CRUD Success
  on(
    SubmissionsActions.createSubmissionSuccess,
    (state, { submission }) =>
      submissionsAdapter.addOne(submission, { ...state, error: null }),
  ),
  on(
    SubmissionsActions.updateSubmissionSuccess,
    (state, { submission }) =>
      submissionsAdapter.updateOne(
        { id: submission.id ?? '', changes: submission },
        { ...state, error: null },
      ),
  ),
  on(
    SubmissionsActions.deleteSubmissionSuccess,
    (state, { submission }) =>
      submissionsAdapter.removeOne(submission?.id ?? '', {
        ...state,
        error: null,
      }),
  ),

  // Domain actions success
  on(
    SubmissionsActions.submitForReviewSuccess,
    (state, { submission }) =>
      submissionsAdapter.updateOne(
        { id: submission.id ?? '', changes: submission },
        { ...state, error: null },
      ),
  ),
  on(
    SubmissionsActions.requestAIFeedbackSuccess,
    (state, { feedback, submission }) => {
      const newFeedbackBySubmission = {
        ...state.feedbackBySubmissionId,
        [submission.id]: [
          ...(state.feedbackBySubmissionId[submission.id] || []),
          feedback,
        ],
      };
      return submissionsAdapter.updateOne(
        { id: submission.id ?? '', changes: submission },
        {
          ...state,
          error: null,
          feedbackBySubmissionId: newFeedbackBySubmission,
        },
      );
    },
  ),

  // Feedback loading
  on(SubmissionsActions.loadFeedback, (state) => ({
    ...state,
    feedbackLoading: true,
  })),
  on(
    SubmissionsActions.loadFeedbackSuccess,
    (state, { submissionId, feedback }) => ({
      ...state,
      feedbackLoading: false,
      feedbackBySubmissionId: {
        ...state.feedbackBySubmissionId,
        [submissionId]: feedback,
      },
    }),
  ),
  on(SubmissionsActions.loadFeedbackFailure, (state, { error }) => ({
    ...state,
    feedbackLoading: false,
    error,
  })),

  // Mentor submissions
  on(SubmissionsActions.loadMentorSubmissions, (state) => ({
    ...state,
    mentorSubmissionsLoaded: false,
    error: null,
  })),
  on(
    SubmissionsActions.loadMentorSubmissionsSuccess,
    (state, { submissions }) => ({
      ...state,
      mentorSubmissions: submissions,
      mentorSubmissionsLoaded: true,
      error: null,
    }),
  ),
  on(SubmissionsActions.loadMentorSubmissionsFailure, (state, { error }) => ({
    ...state,
    mentorSubmissionsLoaded: false,
    error,
  })),

  // Mentor feedback
  on(
    SubmissionsActions.submitMentorFeedbackSuccess,
    (state, { feedback, submission }) => {
      const newFeedbackBySubmission = {
        ...state.feedbackBySubmissionId,
        [submission.id]: [
          ...(state.feedbackBySubmissionId[submission.id] || []),
          feedback,
        ],
      };
      // Update the submission in mentor submissions list
      const updatedMentorSubmissions = state.mentorSubmissions.map((s) =>
        s.id === submission.id ? submission : s,
      );
      return submissionsAdapter.updateOne(
        { id: submission.id ?? '', changes: submission },
        {
          ...state,
          error: null,
          feedbackBySubmissionId: newFeedbackBySubmission,
          mentorSubmissions: updatedMentorSubmissions,
        },
      );
    },
  ),

  // Failures
  on(
    SubmissionsActions.loadSubmissionsFailure,
    SubmissionsActions.loadSubmissionFailure,
    SubmissionsActions.loadSubmissionsByUserFailure,
    SubmissionsActions.loadSubmissionsByUnitFailure,
    SubmissionsActions.loadSubmissionsByPathFailure,
    SubmissionsActions.createSubmissionFailure,
    SubmissionsActions.updateSubmissionFailure,
    SubmissionsActions.deleteSubmissionFailure,
    SubmissionsActions.submitForReviewFailure,
    SubmissionsActions.requestAIFeedbackFailure,
    SubmissionsActions.submitMentorFeedbackFailure,
    onFailure,
  ),
);

// --- Feature (selectors included) ---
export const submissionsFeature = createFeature({
  name: SUBMISSIONS_FEATURE_KEY,
  reducer: submissionsReducer,
  extraSelectors: ({ selectSubmissionsState }) => {
    const { selectAll, selectEntities, selectIds, selectTotal } =
      submissionsAdapter.getSelectors(selectSubmissionsState);

    const selectSelectedId = createSelector(
      selectSubmissionsState,
      (s) => s.selectedId,
    );

    const selectSelectedSubmission = createSelector(
      selectEntities,
      selectSelectedId,
      (entities, id) => (id ? (entities[id] ?? null) : null),
    );

    const selectSubmissionsByUserId = (userId: string) =>
      createSelector(selectAll, (submissions) =>
        submissions.filter((s) => s.userId === userId),
      );

    const selectSubmissionsByUnitId = (unitId: string) =>
      createSelector(selectAll, (submissions) =>
        submissions.filter((s) => s.unitId === unitId),
      );

    const selectSubmissionsByPathId = (pathId: string) =>
      createSelector(selectAll, (submissions) =>
        submissions.filter((s) => s.pathId === pathId),
      );

    const selectSubmissionsByStatus = (status: string) =>
      createSelector(selectAll, (submissions) =>
        submissions.filter((s) => s.status === status),
      );

    const selectFeedbackBySubmissionId = createSelector(
      selectSubmissionsState,
      (s) => s.feedbackBySubmissionId,
    );

    const selectFeedbackForSubmission = (submissionId: string) =>
      createSelector(
        selectFeedbackBySubmissionId,
        (feedbackMap) => feedbackMap[submissionId] || [],
      );

    const selectMentorSubmissions = createSelector(
      selectSubmissionsState,
      (s) => s.mentorSubmissions,
    );

    const selectMentorSubmissionsLoaded = createSelector(
      selectSubmissionsState,
      (s) => s.mentorSubmissionsLoaded,
    );

    return {
      // Adapter-powered
      selectAllSubmissions: selectAll,
      selectSubmissionEntities: selectEntities,
      selectSubmissionIds: selectIds,
      selectSubmissionsTotal: selectTotal,

      // Additional
      selectSubmissionsLoaded: createSelector(
        selectSubmissionsState,
        (s) => s.loaded,
      ),
      selectSubmissionsError: createSelector(
        selectSubmissionsState,
        (s) => s.error,
      ),
      selectFeedbackLoading: createSelector(
        selectSubmissionsState,
        (s) => s.feedbackLoading,
      ),
      selectSelectedId,
      selectSelectedSubmission,
      selectSubmissionsByUserId,
      selectSubmissionsByUnitId,
      selectSubmissionsByPathId,
      selectSubmissionsByStatus,
      selectFeedbackBySubmissionId,
      selectFeedbackForSubmission,
      selectMentorSubmissions,
      selectMentorSubmissionsLoaded,
    };
  },
});

// Optional re-exports for convenience
export const {
  selectAllSubmissions,
  selectSubmissionEntities,
  selectSubmissionIds,
  selectSubmissionsTotal,
  selectSubmissionsLoaded,
  selectSubmissionsError,
  selectFeedbackLoading,
  selectSelectedId,
  selectSelectedSubmission,
  selectSubmissionsByUserId,
  selectSubmissionsByUnitId,
  selectSubmissionsByPathId,
  selectSubmissionsByStatus,
  selectFeedbackBySubmissionId,
  selectFeedbackForSubmission,
  selectMentorSubmissions,
  selectMentorSubmissionsLoaded,
} = submissionsFeature;
