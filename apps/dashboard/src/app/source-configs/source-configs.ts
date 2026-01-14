import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { SourceConfig } from '@kasita/common-models';
import { SourceConfigFacade } from '@kasita/core-state';
import { MaterialModule } from '@kasita/material';
import { SourceConfigDetail } from './source-config-detail/source-config-detail';
import { SourceConfigsList } from './source-configs-list/source-configs-list';
import { SearchFilterBar, FilterConfig, SearchFilterState } from '../shared/search-filter-bar/search-filter-bar';
import { filterEntities, commonFilterMatchers } from '../shared/search-filter-bar/filter-utils';

@Component({
  selector: 'app-source-configs',
  imports: [SourceConfigsList, SourceConfigDetail, MaterialModule, SearchFilterBar],
  templateUrl: './source-configs.html',
  styleUrl: './source-configs.scss',
})
export class SourceConfigs implements OnInit {
  private sourceConfigsFacade = inject(SourceConfigFacade);

  private allSourceConfigs = toSignal(this.sourceConfigsFacade.allSourceConfigs$, { initialValue: [] as SourceConfig[] });
  selectedSourceConfig = toSignal(this.sourceConfigsFacade.selectedSourceConfig$, { initialValue: null });
  loaded = toSignal(this.sourceConfigsFacade.loaded$, { initialValue: false });
  error = toSignal(this.sourceConfigsFacade.error$, { initialValue: null });

  // Search/Filter state
  searchFilterState = signal<SearchFilterState>({ searchTerm: '', filters: {} });

  // Filter configuration
  filterConfigs: FilterConfig[] = [
    {
      field: 'type',
      label: 'Type',
      options: [
        { label: 'RSS', value: 'rss' },
        { label: 'Article', value: 'article' },
        { label: 'PDF', value: 'pdf' },
      ],
    },
    {
      field: 'enabled',
      label: 'Enabled',
      options: [
        { label: 'Yes', value: 'true' },
        { label: 'No', value: 'false' },
      ],
    },
  ];

  // Filtered source configs
  sourceConfigs = computed(() => {
    const all = this.allSourceConfigs();
    const state = this.searchFilterState();
    return filterEntities(
      all,
      state,
      ['name', 'url'],
      {
        type: commonFilterMatchers.exactMatch<SourceConfig>('type'),
        enabled: commonFilterMatchers.boolean<SourceConfig>('enabled'),
      }
    );
  });

  onSearchFilterChange(state: SearchFilterState) {
    this.searchFilterState.set(state);
  }

  constructor() {
    this.sourceConfigsFacade.mutations$.subscribe(() => this.reset());
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
