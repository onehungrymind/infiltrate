import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterModule,
  RouterOutlet,
} from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import {
  CodeVisualizationExample,
  CodeVisualizationService,
} from './services/code-visualization.service';

@Component({
  selector: 'lib-algorithm-viz',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  templateUrl: './algorithm-viz.component.html',
  styleUrl: './algorithm-viz.component.scss',
})
export class AlgorithmVizComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private codeVisualizationService = inject(CodeVisualizationService);
  private destroy$ = new Subject<void>();

  examples: CodeVisualizationExample[] = [];
  selectedExample = signal<CodeVisualizationExample | null>(null);

  ngOnInit(): void {
    this.examples = this.codeVisualizationService.getExamples();

    // Update selected example based on route changes
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.updateSelectedExample();
      });

    // Initial update
    this.updateSelectedExample();

    // Default to first example if none selected
    if (!this.selectedExample() && this.examples.length > 0) {
      this.selectedExample.set(this.examples[0]);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateSelectedExample(): void {
    const currentUrl = this.router.url;
    const routeMatch = currentUrl.match(/\/visualization\/([^/]+)/);
    if (routeMatch && routeMatch[1]) {
      const example = this.examples.find((ex) => ex.route === routeMatch[1]);
      if (example) {
        this.selectedExample.set(example);
        return;
      }
    }
  }

  onExampleChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const exampleId = target.value;
    const example = this.codeVisualizationService.getExampleById(exampleId);

    if (example) {
      this.selectedExample.set(example);
      this.router.navigate(['/visualization', example.route]);
    }
  }

  getSelectedExampleId(): string {
    return this.selectedExample()?.id || '';
  }
}
