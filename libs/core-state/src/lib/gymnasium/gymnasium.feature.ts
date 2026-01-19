import { createFeature, createReducer, on, createSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { Session, SessionTemplate } from '@kasita/common-models';
import { GymnasiumActions } from './gymnasium.actions';

export const GYMNASIUM_FEATURE_KEY = 'gymnasium';

export interface GymnasiumState extends EntityState<Session> {
  selectedId: string | null;
  error: string | null;
  loaded: boolean;
  loading: boolean;
  generating: boolean;
  total: number;
  renderedHtml: { [sessionId: string]: string };
  templates: SessionTemplate[];
  templatesLoaded: boolean;
  defaultTemplate: SessionTemplate | null;
}

export const sessionsAdapter: EntityAdapter<Session> =
  createEntityAdapter<Session>();

export const initialGymnasiumState: GymnasiumState =
  sessionsAdapter.getInitialState({
    selectedId: null,
    error: null,
    loaded: false,
    loading: false,
    generating: false,
    total: 0,
    renderedHtml: {},
    templates: [],
    templatesLoaded: false,
    defaultTemplate: null,
  });

const onFailure = (
  state: GymnasiumState,
  { error }: { error: string | null },
) => ({
  ...state,
  error,
  loading: false,
  generating: false,
});

const gymnasiumReducer = createReducer(
  initialGymnasiumState,

  // Load flags
  on(GymnasiumActions.loadSessions, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(GymnasiumActions.loadPublicSessions, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(GymnasiumActions.loadSession, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  // Selection / Reset
  on(GymnasiumActions.selectSession, (state, { selectedId }) => ({
    ...state,
    selectedId,
  })),
  on(GymnasiumActions.resetSelectedSession, (state) => ({
    ...state,
    selectedId: null,
  })),
  on(GymnasiumActions.resetSessions, (state) =>
    sessionsAdapter.removeAll({
      ...state,
      selectedId: null,
      loaded: false,
      total: 0,
    }),
  ),

  // Load Success
  on(GymnasiumActions.loadSessionsSuccess, (state, { sessions, total }) =>
    sessionsAdapter.setAll(sessions, {
      ...state,
      loaded: true,
      loading: false,
      total,
      error: null,
    }),
  ),
  on(GymnasiumActions.loadPublicSessionsSuccess, (state, { sessions }) =>
    sessionsAdapter.setAll(sessions, {
      ...state,
      loaded: true,
      loading: false,
      error: null,
    }),
  ),
  on(GymnasiumActions.loadSessionSuccess, (state, { session }) =>
    sessionsAdapter.upsertOne(session, {
      ...state,
      loaded: true,
      loading: false,
      error: null,
    }),
  ),

  // Render Success
  on(GymnasiumActions.renderSessionSuccess, (state, { sessionId, html }) => ({
    ...state,
    renderedHtml: { ...state.renderedHtml, [sessionId]: html },
  })),

  // CRUD Success
  on(GymnasiumActions.createSessionSuccess, (state, { session }) =>
    sessionsAdapter.addOne(session, { ...state, error: null, generating: false }),
  ),
  on(GymnasiumActions.updateSessionSuccess, (state, { session }) =>
    sessionsAdapter.updateOne(
      { id: session.id, changes: session },
      { ...state, error: null },
    ),
  ),
  on(GymnasiumActions.deleteSessionSuccess, (state, { session }) =>
    sessionsAdapter.removeOne(session.id, { ...state, error: null }),
  ),

  // Publish/Unpublish
  on(GymnasiumActions.publishSessionSuccess, (state, { session }) =>
    sessionsAdapter.updateOne(
      { id: session.id, changes: session },
      { ...state, error: null },
    ),
  ),
  on(GymnasiumActions.unpublishSessionSuccess, (state, { session }) =>
    sessionsAdapter.updateOne(
      { id: session.id, changes: session },
      { ...state, error: null },
    ),
  ),

  // Generation
  on(GymnasiumActions.generateSession, (state) => ({
    ...state,
    generating: true,
    error: null,
  })),
  on(GymnasiumActions.generateSessionSuccess, (state, { session }) =>
    sessionsAdapter.addOne(session, {
      ...state,
      generating: false,
      selectedId: session.id,
      error: null,
    }),
  ),

  // Templates
  on(GymnasiumActions.loadTemplatesSuccess, (state, { templates }) => ({
    ...state,
    templates,
    templatesLoaded: true,
    error: null,
  })),
  on(GymnasiumActions.loadDefaultTemplateSuccess, (state, { template }) => ({
    ...state,
    defaultTemplate: template,
    error: null,
  })),

  // Failures
  on(
    GymnasiumActions.loadSessionsFailure,
    GymnasiumActions.loadPublicSessionsFailure,
    GymnasiumActions.loadSessionFailure,
    GymnasiumActions.renderSessionFailure,
    GymnasiumActions.createSessionFailure,
    GymnasiumActions.updateSessionFailure,
    GymnasiumActions.deleteSessionFailure,
    GymnasiumActions.publishSessionFailure,
    GymnasiumActions.unpublishSessionFailure,
    GymnasiumActions.generateSessionFailure,
    GymnasiumActions.loadTemplatesFailure,
    GymnasiumActions.loadDefaultTemplateFailure,
    onFailure,
  ),
);

export const gymnasiumFeature = createFeature({
  name: GYMNASIUM_FEATURE_KEY,
  reducer: gymnasiumReducer,
  extraSelectors: ({ selectGymnasiumState }) => {
    const { selectAll, selectEntities, selectIds, selectTotal } =
      sessionsAdapter.getSelectors(selectGymnasiumState);

    const selectSelectedId = createSelector(
      selectGymnasiumState,
      (s) => s.selectedId,
    );

    const selectSelectedSession = createSelector(
      selectEntities,
      selectSelectedId,
      (entities, id) => (id ? (entities[id] ?? null) : null),
    );

    const selectRenderedHtml = createSelector(
      selectGymnasiumState,
      (s) => s.renderedHtml,
    );

    const selectSessionHtml = (sessionId: string) =>
      createSelector(selectRenderedHtml, (htmlMap) => htmlMap[sessionId] || null);

    const selectSessionsByDomain = (domain: string) =>
      createSelector(selectAll, (sessions) =>
        sessions.filter((s) => s.domain === domain),
      );

    const selectPublicSessions = createSelector(selectAll, (sessions) =>
      sessions.filter((s) => s.visibility === 'public'),
    );

    return {
      selectAllSessions: selectAll,
      selectSessionEntities: selectEntities,
      selectSessionIds: selectIds,
      selectSessionsTotal: selectTotal,
      selectSessionsLoaded: createSelector(
        selectGymnasiumState,
        (s) => s.loaded,
      ),
      selectSessionsLoading: createSelector(
        selectGymnasiumState,
        (s) => s.loading,
      ),
      selectSessionsGenerating: createSelector(
        selectGymnasiumState,
        (s) => s.generating,
      ),
      selectSessionsError: createSelector(
        selectGymnasiumState,
        (s) => s.error,
      ),
      selectTotalCount: createSelector(
        selectGymnasiumState,
        (s) => s.total,
      ),
      selectSelectedId,
      selectSelectedSession,
      selectRenderedHtml,
      selectSessionHtml,
      selectSessionsByDomain,
      selectPublicSessions,
      selectTemplates: createSelector(
        selectGymnasiumState,
        (s) => s.templates,
      ),
      selectTemplatesLoaded: createSelector(
        selectGymnasiumState,
        (s) => s.templatesLoaded,
      ),
      selectDefaultTemplate: createSelector(
        selectGymnasiumState,
        (s) => s.defaultTemplate,
      ),
    };
  },
});

export const {
  selectAllSessions,
  selectSessionEntities,
  selectSessionIds,
  selectSessionsTotal,
  selectSessionsLoaded,
  selectSessionsLoading,
  selectSessionsGenerating,
  selectSessionsError,
  selectTotalCount,
  selectSelectedId,
  selectSelectedSession,
  selectRenderedHtml,
  selectSessionHtml,
  selectSessionsByDomain,
  selectPublicSessions,
  selectTemplates,
  selectTemplatesLoaded,
  selectDefaultTemplate,
} = gymnasiumFeature;
