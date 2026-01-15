import { Component, inject, OnInit, signal, computed, effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { LearningPath, SourceType } from '@kasita/common-models';
import { LearningPathsFacade } from '@kasita/core-state';
import { LearningMapService } from '@kasita/core-data';
import { MaterialModule } from '@kasita/material';
import { SourceDetail } from './source-config-detail/source-config-detail';
import { SourcesList } from './source-configs-list/source-configs-list';
import { SearchFilterBar, FilterConfig, SearchFilterState } from '../shared/search-filter-bar/search-filter-bar';

// Source type for list display (without createdAt/updatedAt since API doesn't return them)
export interface SourceListItem {
  id: string;
  url: string;
  type: SourceType;
  name: string;
  enabled?: boolean;
  linkId?: string;
}

@Component({
  selector: 'app-source-configs',
  imports: [SourcesList, SourceDetail, MaterialModule, SearchFilterBar],
  templateUrl: './source-configs.html',
  styleUrl: './source-configs.scss',
})
export class SourceConfigs implements OnInit {
  private learningMapService = inject(LearningMapService);
  private learningPathsFacade = inject(LearningPathsFacade);

  private allLearningPaths = toSignal(this.learningPathsFacade.allLearningPaths$, { initialValue: [] as LearningPath[] });

  // State
  allSources = signal<SourceListItem[]>([]);
  selectedSource = signal<SourceListItem | null>(null);
  loaded = signal(false);
  error = signal<string | null>(null);
  selectedPathId = signal<string | null>(null);

  // Search/Filter state
  searchFilterState = signal<SearchFilterState>({ searchTerm: '', filters: {} });

  // Dynamic filter configuration based on loaded learning paths
  filterConfigs = computed<FilterConfig[]>(() => {
    const paths = this.allLearningPaths();
    const pathOptions = paths.map(p => ({ label: p.name, value: p.id }));

    return [
      {
        field: 'pathId',
        label: 'Learning Path',
        options: pathOptions,
        fullWidth: true,
        row: 1,
      },
      {
        field: 'type',
        label: 'Type',
        options: [
          { label: 'RSS', value: 'rss' },
          { label: 'Article', value: 'article' },
          { label: 'PDF', value: 'pdf' },
        ],
        row: 2,
      },
    ];
  });

  // Filtered sources based on search term and type filter
  sources = computed(() => {
    const all = this.allSources();
    const state = this.searchFilterState();

    let filtered = all;

    // Apply search term filter
    if (state.searchTerm) {
      const term = state.searchTerm.toLowerCase();
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(term) ||
        s.url.toLowerCase().includes(term)
      );
    }

    // Apply type filter
    const typeFilter = state.filters['type'];
    if (typeFilter && typeFilter !== '') {
      filtered = filtered.filter(s => s.type === typeFilter);
    }

    return filtered;
  });

  constructor() {
    // React to path filter changes
    effect(() => {
      const state = this.searchFilterState();
      const pathId = state.filters['pathId'] as string || null;

      // Only reload if pathId actually changed
      if (pathId !== this.selectedPathId()) {
        this.selectedPathId.set(pathId);
        this.loadSources();
      }
    });
  }

  ngOnInit(): void {
    this.learningPathsFacade.loadLearningPaths();
    this.loadSources();
  }

  onSearchFilterChange(state: SearchFilterState) {
    this.searchFilterState.set(state);
  }

  loadSources() {
    this.loaded.set(false);
    this.error.set(null);

    const pathId = this.selectedPathId();

    if (pathId) {
      // Load sources for specific path (with enabled status)
      this.learningMapService.getSourcesForPath(pathId).subscribe({
        next: (sources) => {
          this.allSources.set(sources.map(s => ({
            id: s.id,
            url: s.url,
            type: s.type as 'rss' | 'article' | 'pdf',
            name: s.name,
            enabled: s.enabled,
            linkId: s.linkId,
          })));
          this.loaded.set(true);
        },
        error: (err) => {
          this.error.set('Failed to load sources');
          this.loaded.set(true);
        }
      });
    } else {
      // Load all sources (no enabled status)
      this.learningMapService.getAllSources().subscribe({
        next: (sources) => {
          this.allSources.set(sources.map(s => ({
            id: s.id,
            url: s.url,
            type: s.type as 'rss' | 'article' | 'pdf',
            name: s.name,
          })));
          this.loaded.set(true);
        },
        error: (err) => {
          this.error.set('Failed to load sources');
          this.loaded.set(true);
        }
      });
    }
  }

  selectSource(source: SourceListItem) {
    this.selectedSource.set(source);
  }

  saveSource(source: Partial<SourceListItem>) {
    const currentSource = this.selectedSource();
    const pathId = this.selectedPathId();

    if (currentSource?.id) {
      // Update existing source
      this.learningMapService.updateSource(currentSource.id, {
        name: source.name,
        type: source.type,
      }).subscribe({
        next: () => {
          this.loadSources();
          this.selectedSource.set(null);
        },
        error: (err) => {
          console.error('Failed to update source:', err);
        }
      });
    } else {
      // Create new source
      if (pathId) {
        // Create and link to current path
        this.learningMapService.createAndLinkSource(
          { url: source.url!, type: source.type!, name: source.name! },
          pathId
        ).subscribe({
          next: () => {
            this.loadSources();
            this.selectedSource.set(null);
          },
          error: (err) => {
            console.error('Failed to create source:', err);
          }
        });
      } else {
        // Create without linking
        this.learningMapService.createSource({
          url: source.url!,
          type: source.type!,
          name: source.name!,
        }).subscribe({
          next: () => {
            this.loadSources();
            this.selectedSource.set(null);
          },
          error: (err) => {
            console.error('Failed to create source:', err);
          }
        });
      }
    }
  }

  deleteSource(source: SourceListItem) {
    this.learningMapService.deleteSource(source.id).subscribe({
      next: () => {
        this.loadSources();
        if (this.selectedSource()?.id === source.id) {
          this.selectedSource.set(null);
        }
      },
      error: (err) => {
        console.error('Failed to delete source:', err);
      }
    });
  }

  toggleEnabled(source: SourceListItem) {
    const pathId = this.selectedPathId();
    if (!pathId || source.enabled === undefined) return;

    this.learningMapService.updateSourceLink(source.id, pathId, !source.enabled).subscribe({
      next: () => {
        this.loadSources();
      },
      error: (err) => {
        console.error('Failed to toggle enabled:', err);
      }
    });
  }

  cancel() {
    this.selectedSource.set(null);
  }
}
