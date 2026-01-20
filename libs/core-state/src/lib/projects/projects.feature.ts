import { createFeature, createReducer, on, createSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { Project } from '@kasita/common-models';
import { ProjectsActions } from './projects.actions';

export const PROJECTS_FEATURE_KEY = 'projects';

export interface ProjectsState extends EntityState<Project> {
  selectedId: string | null;
  error: string | null;
  loaded: boolean;
}

export const projectsAdapter: EntityAdapter<Project> =
  createEntityAdapter<Project>();

export const initialProjectsState: ProjectsState =
  projectsAdapter.getInitialState({
    selectedId: null,
    error: null,
    loaded: false,
  });

const onFailure = (
  state: ProjectsState,
  { error }: { error: string | null },
) => ({
  ...state,
  error,
});

const projectsReducer = createReducer(
  initialProjectsState,

  // Load flags
  on(ProjectsActions.loadProjects, (state) => ({
    ...state,
    loaded: false,
    error: null,
  })),
  on(ProjectsActions.loadProject, (state) => ({
    ...state,
    loaded: false,
    error: null,
  })),
  on(ProjectsActions.loadProjectsByPath, (state) => ({
    ...state,
    loaded: false,
    error: null,
  })),

  // Selection / Reset
  on(ProjectsActions.selectProject, (state, { selectedId }) => ({
    ...state,
    selectedId,
  })),
  on(ProjectsActions.resetSelectedProject, (state) => ({
    ...state,
    selectedId: null,
  })),
  on(ProjectsActions.resetProjects, (state) =>
    projectsAdapter.removeAll({
      ...state,
      selectedId: null,
      loaded: false,
    }),
  ),

  // Load Success
  on(ProjectsActions.loadProjectsSuccess, (state, { projects }) =>
    projectsAdapter.setAll(projects, {
      ...state,
      loaded: true,
      error: null,
    }),
  ),
  on(ProjectsActions.loadProjectsByPathSuccess, (state, { projects }) =>
    projectsAdapter.setAll(projects, {
      ...state,
      loaded: true,
      error: null,
    }),
  ),
  on(ProjectsActions.loadProjectSuccess, (state, { project }) =>
    projectsAdapter.upsertOne(project, {
      ...state,
      loaded: true,
      error: null,
    }),
  ),

  // CRUD Success
  on(ProjectsActions.createProjectSuccess, (state, { project }) =>
    projectsAdapter.addOne(project, { ...state, error: null }),
  ),
  on(ProjectsActions.updateProjectSuccess, (state, { project }) =>
    projectsAdapter.updateOne(
      { id: project.id ?? '', changes: project },
      { ...state, error: null },
    ),
  ),
  on(ProjectsActions.deleteProjectSuccess, (state, { project }) =>
    projectsAdapter.removeOne(project?.id ?? '', {
      ...state,
      error: null,
    }),
  ),

  // Concept linking success - reload project to get updated principles
  on(ProjectsActions.linkConceptSuccess, (state) => ({
    ...state,
    error: null,
  })),
  on(ProjectsActions.unlinkConceptSuccess, (state) => ({
    ...state,
    error: null,
  })),

  // Failures
  on(
    ProjectsActions.loadProjectsFailure,
    ProjectsActions.loadProjectFailure,
    ProjectsActions.loadProjectsByPathFailure,
    ProjectsActions.createProjectFailure,
    ProjectsActions.updateProjectFailure,
    ProjectsActions.deleteProjectFailure,
    ProjectsActions.linkConceptFailure,
    ProjectsActions.unlinkConceptFailure,
    onFailure,
  ),
);

export const projectsFeature = createFeature({
  name: PROJECTS_FEATURE_KEY,
  reducer: projectsReducer,
  extraSelectors: ({ selectProjectsState }) => {
    const { selectAll, selectEntities, selectIds, selectTotal } =
      projectsAdapter.getSelectors(selectProjectsState);

    const selectSelectedId = createSelector(
      selectProjectsState,
      (s) => s.selectedId,
    );

    const selectSelectedProject = createSelector(
      selectEntities,
      selectSelectedId,
      (entities, id) => (id ? (entities[id] ?? null) : null),
    );

    const selectProjectsByPathId = (pathId: string) =>
      createSelector(selectAll, (projects) =>
        projects.filter((p) => p.pathId === pathId),
      );

    return {
      selectAllProjects: selectAll,
      selectProjectEntities: selectEntities,
      selectProjectIds: selectIds,
      selectProjectsTotal: selectTotal,
      selectProjectsLoaded: createSelector(
        selectProjectsState,
        (s) => s.loaded,
      ),
      selectProjectsError: createSelector(
        selectProjectsState,
        (s) => s.error,
      ),
      selectSelectedId,
      selectSelectedProject,
      selectProjectsByPathId,
    };
  },
});

export const {
  selectAllProjects,
  selectProjectEntities,
  selectProjectIds,
  selectProjectsTotal,
  selectProjectsLoaded,
  selectProjectsError,
  selectSelectedId,
  selectSelectedProject,
  selectProjectsByPathId,
} = projectsFeature;
