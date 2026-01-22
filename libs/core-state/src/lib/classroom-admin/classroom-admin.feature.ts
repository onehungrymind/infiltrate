import { createFeature, createReducer, on, createSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import {
  ClassroomOverview,
  ClassroomContent,
  PathStatus,
  JobsResponse,
} from '@kasita/core-data';
import { ClassroomAdminActions } from './classroom-admin.actions';

export const CLASSROOM_ADMIN_FEATURE_KEY = 'classroomAdmin';

export interface ClassroomAdminState extends EntityState<ClassroomContent> {
  overview: ClassroomOverview | null;
  pathStatus: PathStatus | null;
  errors: ClassroomContent[];
  jobs: JobsResponse | null;
  selectedContentId: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  loading: boolean;
  error: string | null;
}

export const classroomAdminAdapter: EntityAdapter<ClassroomContent> =
  createEntityAdapter<ClassroomContent>();

export const initialClassroomAdminState: ClassroomAdminState =
  classroomAdminAdapter.getInitialState({
    overview: null,
    pathStatus: null,
    errors: [],
    jobs: null,
    selectedContentId: null,
    pagination: null,
    loading: false,
    error: null,
  });

const onFailure = (
  state: ClassroomAdminState,
  { error }: { error: string | null },
) => ({
  ...state,
  loading: false,
  error,
});

const classroomAdminReducer = createReducer(
  initialClassroomAdminState,

  // Overview
  on(ClassroomAdminActions.loadOverview, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ClassroomAdminActions.loadOverviewSuccess, (state, { overview }) => ({
    ...state,
    overview,
    loading: false,
  })),
  on(ClassroomAdminActions.loadOverviewFailure, onFailure),

  // Path Status
  on(ClassroomAdminActions.loadPathStatus, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ClassroomAdminActions.loadPathStatusSuccess, (state, { pathStatus }) => ({
    ...state,
    pathStatus,
    loading: false,
  })),
  on(ClassroomAdminActions.loadPathStatusFailure, onFailure),

  // Content List
  on(ClassroomAdminActions.loadContentList, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ClassroomAdminActions.loadContentListSuccess, (state, { response }) =>
    classroomAdminAdapter.setAll(response.items, {
      ...state,
      pagination: response.pagination,
      loading: false,
    }),
  ),
  on(ClassroomAdminActions.loadContentListFailure, onFailure),

  // Single Content
  on(ClassroomAdminActions.loadContent, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ClassroomAdminActions.loadContentSuccess, (state, { content }) =>
    classroomAdminAdapter.upsertOne(content, {
      ...state,
      loading: false,
    }),
  ),
  on(ClassroomAdminActions.loadContentFailure, onFailure),

  // Errors
  on(ClassroomAdminActions.loadErrors, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ClassroomAdminActions.loadErrorsSuccess, (state, { errors }) => ({
    ...state,
    errors,
    loading: false,
  })),
  on(ClassroomAdminActions.loadErrorsFailure, onFailure),

  // Generate for Path
  on(ClassroomAdminActions.generateForPath, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ClassroomAdminActions.generateForPathSuccess, (state) => ({
    ...state,
    loading: false,
  })),
  on(ClassroomAdminActions.generateForPathFailure, onFailure),

  // Generate for Concept
  on(ClassroomAdminActions.generateForConcept, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ClassroomAdminActions.generateForConceptSuccess, (state) => ({
    ...state,
    loading: false,
  })),
  on(ClassroomAdminActions.generateForConceptFailure, onFailure),

  // Generate for SubConcept
  on(ClassroomAdminActions.generateForSubConcept, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ClassroomAdminActions.generateForSubConceptSuccess, (state) => ({
    ...state,
    loading: false,
  })),
  on(ClassroomAdminActions.generateForSubConceptFailure, onFailure),

  // Clear Path Content
  on(ClassroomAdminActions.clearPathContent, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ClassroomAdminActions.clearPathContentSuccess, (state, { learningPathId }) =>
    classroomAdminAdapter.removeMany(
      (content) => content.learningPathId === learningPathId,
      { ...state, loading: false },
    ),
  ),
  on(ClassroomAdminActions.clearPathContentFailure, onFailure),

  // Update Content
  on(ClassroomAdminActions.updateContent, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ClassroomAdminActions.updateContentSuccess, (state, { content }) =>
    classroomAdminAdapter.updateOne(
      { id: content.id, changes: content },
      { ...state, loading: false },
    ),
  ),
  on(ClassroomAdminActions.updateContentFailure, onFailure),

  // Approve Content
  on(ClassroomAdminActions.approveContent, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ClassroomAdminActions.approveContentSuccess, (state, { content }) =>
    classroomAdminAdapter.updateOne(
      { id: content.id, changes: content },
      { ...state, loading: false },
    ),
  ),
  on(ClassroomAdminActions.approveContentFailure, onFailure),

  // Regenerate Content
  on(ClassroomAdminActions.regenerateContent, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ClassroomAdminActions.regenerateContentSuccess, (state) => ({
    ...state,
    loading: false,
  })),
  on(ClassroomAdminActions.regenerateContentFailure, onFailure),

  // Jobs
  on(ClassroomAdminActions.loadJobs, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ClassroomAdminActions.loadJobsSuccess, (state, { jobs }) => ({
    ...state,
    jobs,
    loading: false,
  })),
  on(ClassroomAdminActions.loadJobsFailure, onFailure),

  // Cancel Job
  on(ClassroomAdminActions.cancelJob, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ClassroomAdminActions.cancelJobSuccess, (state) => ({
    ...state,
    loading: false,
  })),
  on(ClassroomAdminActions.cancelJobFailure, onFailure),

  // Select Content
  on(ClassroomAdminActions.selectContent, (state, { contentId }) => ({
    ...state,
    selectedContentId: contentId,
  })),

  // Reset
  on(ClassroomAdminActions.resetState, () => initialClassroomAdminState),
);

export const classroomAdminFeature = createFeature({
  name: CLASSROOM_ADMIN_FEATURE_KEY,
  reducer: classroomAdminReducer,
  extraSelectors: ({ selectClassroomAdminState }) => {
    const { selectAll, selectEntities, selectIds, selectTotal } =
      classroomAdminAdapter.getSelectors(selectClassroomAdminState);

    const selectSelectedContentId = createSelector(
      selectClassroomAdminState,
      (s) => s.selectedContentId,
    );

    const selectSelectedContent = createSelector(
      selectEntities,
      selectSelectedContentId,
      (entities, id) => (id ? (entities[id] ?? null) : null),
    );

    const selectContentByStatus = (status: string) =>
      createSelector(selectAll, (content) =>
        content.filter((c) => c.status === status),
      );

    const selectContentByPath = (learningPathId: string) =>
      createSelector(selectAll, (content) =>
        content.filter((c) => c.learningPathId === learningPathId),
      );

    return {
      selectAllContent: selectAll,
      selectContentEntities: selectEntities,
      selectContentIds: selectIds,
      selectContentTotal: selectTotal,
      selectOverview: createSelector(
        selectClassroomAdminState,
        (s) => s.overview,
      ),
      selectPathStatus: createSelector(
        selectClassroomAdminState,
        (s) => s.pathStatus,
      ),
      selectErrors: createSelector(
        selectClassroomAdminState,
        (s) => s.errors,
      ),
      selectJobs: createSelector(
        selectClassroomAdminState,
        (s) => s.jobs,
      ),
      selectPagination: createSelector(
        selectClassroomAdminState,
        (s) => s.pagination,
      ),
      selectLoading: createSelector(
        selectClassroomAdminState,
        (s) => s.loading,
      ),
      selectError: createSelector(
        selectClassroomAdminState,
        (s) => s.error,
      ),
      selectSelectedContentId,
      selectSelectedContent,
      selectContentByStatus,
      selectContentByPath,
    };
  },
});

export const {
  selectAllContent,
  selectContentEntities,
  selectContentIds,
  selectContentTotal,
  selectOverview,
  selectPathStatus,
  selectErrors,
  selectJobs,
  selectPagination,
  selectLoading,
  selectError,
  selectSelectedContentId,
  selectSelectedContent,
  selectContentByStatus,
  selectContentByPath,
} = classroomAdminFeature;
