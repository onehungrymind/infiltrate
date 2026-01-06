import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { SourceConfig } from '@kasita/common-models';
import { SourceConfigFacade } from '@kasita/core-state';
import { Observable } from 'rxjs';
import { SourceConfigDetail } from './source-config-detail/source-config-detail';
import { SourceConfigsList } from './source-configs-list/source-configs-list';

@Component({
  selector: 'app-source-configs',
  imports: [SourceConfigsList, SourceConfigDetail, AsyncPipe],
  templateUrl: './source-configs.html',
  styleUrl: './source-configs.scss',
})
export class SourceConfigs implements OnInit {
  private sourceConfigsFacade = inject(SourceConfigFacade);

  sourceConfigs$: Observable<SourceConfig[]> =
    this.sourceConfigsFacade.allSourceConfigs$;
  selectedSourceConfig$: Observable<SourceConfig | null> =
    this.sourceConfigsFacade.selectedSourceConfig$;
  mutations$ = this.sourceConfigsFacade.mutations$;

  constructor() {
    this.mutations$.subscribe(() => this.reset());
  }

  ngOnInit(): void {
    this.reset();
  }

  reset() {
    this.loadSourceConfigs();
    this.sourceConfigsFacade.resetSelectedSourceConfig();
  }

  selectSourceConfig(sourceConfig: SourceConfig) {
    this.sourceConfigsFacade.selectSourceConfig(sourceConfig.id as string);
  }

  loadSourceConfigs() {
    this.sourceConfigsFacade.loadSourceConfigs();
  }

  saveSourceConfig(sourceConfig: SourceConfig) {
    this.sourceConfigsFacade.saveSourceConfig(sourceConfig);
  }

  deleteSourceConfig(sourceConfig: SourceConfig) {
    this.sourceConfigsFacade.deleteSourceConfig(sourceConfig);
  }

  cancel() {
    this.sourceConfigsFacade.resetSelectedSourceConfig();
  }
}
