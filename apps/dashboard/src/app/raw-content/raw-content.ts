import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RawContent as RawContentModel } from '@kasita/common-models';
import { RawContentFacade } from '@kasita/core-state';
import { MaterialModule } from '@kasita/material';
import { RawContentDetail } from './raw-content-detail/raw-content-detail';
import { RawContentList } from './raw-content-list/raw-content-list';
import { SearchFilterBar, FilterConfig, SearchFilterState } from '../shared/search-filter-bar/search-filter-bar';
import { filterEntities, commonFilterMatchers } from '../shared/search-filter-bar/filter-utils';

@Component({
  selector: 'app-raw-content',
  imports: [RawContentList, RawContentDetail, MaterialModule, SearchFilterBar],
  templateUrl: './raw-content.html',
  styleUrl: './raw-content.scss',
})
export class RawContent implements OnInit {
  private rawContentFacade = inject(RawContentFacade);

  private allRawContent = toSignal(this.rawContentFacade.allRawContent$, { initialValue: [] as RawContentModel[] });
  selectedRawContent = toSignal(this.rawContentFacade.selectedRawContent$, { initialValue: null });
  loaded = toSignal(this.rawContentFacade.loaded$, { initialValue: false });
  error = toSignal(this.rawContentFacade.error$, { initialValue: null });

  // Search/Filter state
  searchFilterState = signal<SearchFilterState>({ searchTerm: '', filters: {} });

  // Filter configuration
  filterConfigs: FilterConfig[] = [
    {
      field: 'sourceType',
      label: 'Source Type',
      options: [
        { label: 'RSS', value: 'rss' },
        { label: 'Article', value: 'article' },
        { label: 'PDF', value: 'pdf' },
      ],
    },
  ];

  // Filtered raw content
  rawContent = computed(() => {
    const all = this.allRawContent();
    const state = this.searchFilterState();
    return filterEntities(
      all,
      state,
      ['title', 'author', 'sourceUrl'],
      {
        sourceType: commonFilterMatchers.exactMatch<RawContentModel>('sourceType'),
      }
    );
  });

  onSearchFilterChange(state: SearchFilterState) {
    this.searchFilterState.set(state);
  }

  constructor() {
    this.rawContentFacade.mutations$.subscribe(() => this.reset());
  }

  ngOnInit(): void {
    this.reset();
  }

  reset() {
    this.loadRawContent();
    this.rawContentFacade.resetSelectedRawContent();
  }

  selectRawContent(rawContent: RawContentModel) {
    this.rawContentFacade.selectRawContent(rawContent.id as string);
  }

  loadRawContent() {
    this.rawContentFacade.loadRawContent();
  }

  saveRawContent(rawContent: RawContentModel) {
    this.rawContentFacade.saveRawContent(rawContent);
  }

  deleteRawContent(rawContent: RawContentModel) {
    this.rawContentFacade.deleteRawContent(rawContent);
  }

  cancel() {
    this.rawContentFacade.resetSelectedRawContent();
  }
}
