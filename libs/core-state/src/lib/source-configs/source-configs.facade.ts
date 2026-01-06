import { Injectable, inject } from '@angular/core';
import { SourceConfig } from '@kasita/common-models';
import { Action, ActionsSubject, Store } from '@ngrx/store';
import { SourceConfigsActions } from './source-configs.actions';

import {
  selectAllSourceConfigs,
  selectSourceConfigsLoaded,
  selectSourceConfigsError,
  selectSelectedSourceConfig,
} from './source-configs.feature';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SourceConfigFacade {
  private readonly store = inject(Store);
  private readonly actions$ = inject(ActionsSubject);

  loaded$ = this.store.select(selectSourceConfigsLoaded);
  error$ = this.store.select(selectSourceConfigsError);
  allSourceConfigs$ = this.store.select(selectAllSourceConfigs);
  selectedSourceConfig$ = this.store.select(selectSelectedSourceConfig);

  mutations$ = this.actions$.pipe(
    filter(
      (action) =>
        action.type === SourceConfigsActions.createSourceConfig.type ||
        action.type === SourceConfigsActions.updateSourceConfig.type ||
        action.type === SourceConfigsActions.deleteSourceConfig.type,
    ),
  );

  resetSelectedSourceConfig() {
    this.dispatch(SourceConfigsActions.resetSelectedSourceConfig());
  }

  selectSourceConfig(selectedId: string) {
    this.dispatch(SourceConfigsActions.selectSourceConfig({ selectedId }));
  }

  loadSourceConfigs() {
    this.dispatch(SourceConfigsActions.loadSourceConfigs());
  }

  loadSourceConfig(sourceConfigId: string) {
    this.dispatch(SourceConfigsActions.loadSourceConfig({ sourceConfigId }));
  }

  saveSourceConfig(sourceConfig: SourceConfig) {
    if (sourceConfig.id) {
      this.updateSourceConfig(sourceConfig);
    } else {
      this.createSourceConfig(sourceConfig);
    }
  }

  createSourceConfig(sourceConfig: SourceConfig) {
    this.dispatch(SourceConfigsActions.createSourceConfig({ sourceConfig }));
  }

  updateSourceConfig(sourceConfig: SourceConfig) {
    this.dispatch(SourceConfigsActions.updateSourceConfig({ sourceConfig }));
  }

  deleteSourceConfig(sourceConfig: SourceConfig) {
    this.dispatch(SourceConfigsActions.deleteSourceConfig({ sourceConfig }));
  }

  dispatch(action: Action) {
    this.store.dispatch(action);
  }
}
