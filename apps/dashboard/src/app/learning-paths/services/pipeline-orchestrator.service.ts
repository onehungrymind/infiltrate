import { Injectable, inject, signal } from '@angular/core';
import { LearningMapService } from '@kasita/core-data';
import { Observable, concat, of, tap, catchError, finalize, map, delay } from 'rxjs';

export type PipelineStageId = 'principles' | 'sources' | 'ingest' | 'synthesize';

export interface PipelineResult {
  stage: PipelineStageId;
  success: boolean;
  message: string;
  data?: any;
}

@Injectable({
  providedIn: 'root',
})
export class PipelineOrchestratorService {
  private learningMapService = inject(LearningMapService);

  // State
  isRunning = signal(false);
  currentStage = signal<PipelineStageId | null>(null);
  completedStages = signal<PipelineStageId[]>([]);
  errorStage = signal<PipelineStageId | null>(null);
  lastError = signal<string | null>(null);

  // Reset state
  reset() {
    this.isRunning.set(false);
    this.currentStage.set(null);
    this.completedStages.set([]);
    this.errorStage.set(null);
    this.lastError.set(null);
  }

  // Run a single pipeline stage
  runStage<T>(
    stageId: PipelineStageId,
    operation: () => Observable<T>
  ): Observable<PipelineResult> {
    return of(null).pipe(
      tap(() => {
        this.currentStage.set(stageId);
        this.errorStage.set(null);
      }),
      delay(100), // Small delay for UI feedback
      map(() => operation()),
      // flatMap the inner observable
      (source) => new Observable<PipelineResult>((subscriber) => {
        source.subscribe({
          next: (innerObs) => {
            if (innerObs instanceof Observable) {
              innerObs.subscribe({
                next: (data) => {
                  this.completedStages.update((stages) => [...stages, stageId]);
                  subscriber.next({
                    stage: stageId,
                    success: true,
                    message: `${stageId} completed successfully`,
                    data,
                  });
                },
                error: (err) => {
                  this.errorStage.set(stageId);
                  this.lastError.set(err.error?.message || err.message || `${stageId} failed`);
                  subscriber.next({
                    stage: stageId,
                    success: false,
                    message: this.lastError() || `${stageId} failed`,
                  });
                },
                complete: () => subscriber.complete(),
              });
            }
          },
          error: (err) => subscriber.error(err),
        });
      }),
    );
  }

  // Run the full pipeline sequentially
  runFullPipeline(pathId: string): Observable<PipelineResult> {
    this.reset();
    this.isRunning.set(true);

    return concat(
      this.runStage('principles', () => this.learningMapService.generatePrinciples(pathId)),
      this.runStage('sources', () => this.suggestAndAddAllSources(pathId)),
      this.runStage('ingest', () => this.learningMapService.triggerIngestion(pathId)),
      this.runStage('synthesize', () => this.learningMapService.triggerSynthesis(pathId)),
    ).pipe(
      finalize(() => {
        this.isRunning.set(false);
        this.currentStage.set(null);
      }),
    );
  }

  // Helper to suggest sources and add them all
  private suggestAndAddAllSources(pathId: string): Observable<{ message: string; sourcesAdded: number }> {
    return new Observable((subscriber) => {
      this.learningMapService.suggestSources(pathId).subscribe({
        next: (result) => {
          if (result.sources.length === 0) {
            subscriber.next({ message: 'No sources suggested', sourcesAdded: 0 });
            subscriber.complete();
            return;
          }

          // Add all sources sequentially
          let added = 0;
          const addNext = (index: number) => {
            if (index >= result.sources.length) {
              subscriber.next({ message: `Added ${added} sources`, sourcesAdded: added });
              subscriber.complete();
              return;
            }

            const source = result.sources[index];
            this.learningMapService.addSource(pathId, {
              name: source.name,
              url: source.url,
              type: source.type,
            }).subscribe({
              next: () => {
                added++;
                addNext(index + 1);
              },
              error: () => {
                // Continue even if one fails
                addNext(index + 1);
              },
            });
          };

          addNext(0);
        },
        error: (err) => subscriber.error(err),
      });
    });
  }

  // Run a single stage independently
  runPrinciples(pathId: string): Observable<PipelineResult> {
    return this.runStage('principles', () => this.learningMapService.generatePrinciples(pathId));
  }

  runSuggestSources(pathId: string): Observable<PipelineResult> {
    return this.runStage('sources', () => this.suggestAndAddAllSources(pathId));
  }

  runIngestion(pathId: string): Observable<PipelineResult> {
    return this.runStage('ingest', () => this.learningMapService.triggerIngestion(pathId));
  }

  runSynthesis(pathId: string): Observable<PipelineResult> {
    return this.runStage('synthesize', () => this.learningMapService.triggerSynthesis(pathId));
  }
}
