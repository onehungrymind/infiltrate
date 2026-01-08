import { createFeature, createReducer, on, createSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { User } from '@kasita/common-models';
import { UsersActions } from './users.actions';

export const USERS_FEATURE_KEY = 'users';

// --- State & Adapter ---
export interface UsersState extends EntityState<User> {
  selectedId: string | null;
  error: string | null;
  loaded: boolean;
}

export const usersAdapter: EntityAdapter<User> =
  createEntityAdapter<User>();

export const initialUsersState: UsersState =
  usersAdapter.getInitialState({
    selectedId: null,
    error: null,
    loaded: false,
  });

// --- Helper Functions ---
const onFailure = (
  state: UsersState,
  { error }: { error: string | null },
) => ({
  ...state,
  error,
});

const usersReducer = createReducer(
  initialUsersState,

  // Load flags
  on(UsersActions.loadUsers, (state) => ({
    ...state,
    loaded: false,
    error: null,
  })),
  on(UsersActions.loadUser, (state) => ({
    ...state,
    loaded: false,
    error: null,
  })),

  // Selection / Reset
  on(UsersActions.selectUser, (state, { selectedId }) => ({
    ...state,
    selectedId,
  })),
  on(UsersActions.resetSelectedUser, (state) => ({
    ...state,
    selectedId: null,
  })),
  on(UsersActions.resetUsers, (state) =>
    usersAdapter.removeAll({
      ...state,
      selectedId: null,
      loaded: false,
    }),
  ),

  // CRUD Success
  on(
    UsersActions.loadUsersSuccess,
    (state, { users }) =>
      usersAdapter.setAll(users, {
        ...state,
        loaded: true,
        error: null,
      }),
  ),
  on(UsersActions.loadUserSuccess, (state, { user }) =>
    usersAdapter.upsertOne(user, {
      ...state,
      loaded: true,
      error: null,
    }),
  ),
  on(
    UsersActions.createUserSuccess,
    (state, { user }) =>
      usersAdapter.addOne(user, { ...state, error: null }),
  ),
  on(
    UsersActions.updateUserSuccess,
    (state, { user }) =>
      usersAdapter.updateOne(
        { id: user.id ?? '', changes: user },
        { ...state, error: null },
      ),
  ),
  on(
    UsersActions.deleteUserSuccess,
    (state, { user }) =>
      usersAdapter.removeOne(user?.id ?? '', {
        ...state,
        error: null,
      }),
  ),

  // Failures (deduped)
  on(
    UsersActions.loadUsersFailure,
    UsersActions.loadUserFailure,
    UsersActions.createUserFailure,
    UsersActions.updateUserFailure,
    UsersActions.deleteUserFailure,
    onFailure,
  ),
);

// --- Feature (selectors included) ---
export const usersFeature = createFeature({
  name: USERS_FEATURE_KEY,
  reducer: usersReducer,
  extraSelectors: ({ selectUsersState }) => {
    const { selectAll, selectEntities, selectIds, selectTotal } =
      usersAdapter.getSelectors(selectUsersState);

    const selectSelectedId = createSelector(
      selectUsersState,
      (s) => s.selectedId,
    );

    const selectSelectedUser = createSelector(
      selectEntities,
      selectSelectedId,
      (entities, id) => (id ? (entities[id] ?? null) : null),
    );

    return {
      // Adapter-powered
      selectAllUsers: selectAll,
      selectUserEntities: selectEntities,
      selectUserIds: selectIds,
      selectUsersTotal: selectTotal,

      // Additional
      selectUsersLoaded: createSelector(
        selectUsersState,
        (s) => s.loaded,
      ),
      selectUsersError: createSelector(
        selectUsersState,
        (s) => s.error,
      ),
      selectSelectedId,
      selectSelectedUser,
    };
  },
});

// Optional re-exports for convenience
export const {
  selectAllUsers,
  selectUserEntities,
  selectUserIds,
  selectUsersTotal,
  selectUsersLoaded,
  selectUsersError,
  selectSelectedId,
  selectSelectedUser,
} = usersFeature;
