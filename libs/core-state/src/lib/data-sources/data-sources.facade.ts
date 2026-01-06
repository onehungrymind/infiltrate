import { Injectable, inject } from '@angular/core';
import { DataSource } from '@kasita/common-models';
import { Action, ActionsSubject, Store } from '@ngrx/store';
import { DataSourcesActions } from './data-sources.actions';

import {
  selectAllDataSources,
  selectDataSourcesLoaded,
  selectDataSourcesError,
  selectSelectedDataSource,
} from './data-sources.feature';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataSourcesFacade {
  private readonly store = inject(Store);
  private readonly actions$ = inject(ActionsSubject);

  loaded$ = this.store.select(selectDataSourcesLoaded);
  error$ = this.store.select(selectDataSourcesError);
  allDataSources$ = this.store.select(selectAllDataSources);
  selectedDataSource$ = this.store.select(selectSelectedDataSource);

  mutations$ = this.actions$.pipe(
    filter(
      (action) =>
        action.type === DataSourcesActions.createDataSource.type ||
        action.type === DataSourcesActions.updateDataSource.type ||
        action.type === DataSourcesActions.deleteDataSource.type,
    ),
  );

  resetSelectedDataSource() {
    this.dispatch(DataSourcesActions.resetSelectedDataSource());
  }

  selectDataSource(selectedId: string) {
    this.dispatch(DataSourcesActions.selectDataSource({ selectedId }));
  }

  loadDataSources() {
    this.dispatch(DataSourcesActions.loadDataSources());
  }

  loadDataSource(dataSourceId: string) {
    this.dispatch(DataSourcesActions.loadDataSource({ dataSourceId }));
  }

  saveDataSource(dataSource: DataSource) {
    if (dataSource.id) {
      this.updateDataSource(dataSource);
    } else {
      this.createDataSource(dataSource);
    }
  }

  createDataSource(dataSource: DataSource) {
    this.dispatch(DataSourcesActions.createDataSource({ dataSource }));
  }

  updateDataSource(dataSource: DataSource) {
    this.dispatch(DataSourcesActions.updateDataSource({ dataSource }));
  }

  deleteDataSource(dataSource: DataSource) {
    this.dispatch(DataSourcesActions.deleteDataSource({ dataSource }));
  }

  dispatch(action: Action) {
    this.store.dispatch(action);
  }
}

