import { Injectable, inject, signal } from '@angular/core';
import { LearningMapService, ConceptsService, SubConceptsService } from '@kasita/core-data';
import { Observable, concat, of, tap, catchError, finalize, map, delay, from, concatMap } from 'rxjs';
import { Concept, SubConcept } from '@kasita/common-models';

export type PipelineStageId = 'concepts' | 'sub-concepts' | 'knowledge-units' | 'sources' | 'ingest' | 'synthesize';

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
  private conceptsService = inject(ConceptsService);
  private subConceptsService = inject(SubConceptsService);

  // State
  isRunning = signal(false);
  currentStage = signal<PipelineStageId | null>(null);
  completedStages = signal<PipelineStageId[]>([]);
  errorStage = signal<PipelineStageId | null>(null);
  lastError = signal<string | null>(null);

  // Progress tracking for sub-stages
  currentProgress = signal<string>('');

  // Reset state
  reset() {
    this.isRunning.set(false);
    this.currentStage.set(null);
    this.completedStages.set([]);
    this.errorStage.set(null);
    this.lastError.set(null);
    this.currentProgress.set('');
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
      this.runStage('concepts', () => this.learningMapService.generateConcepts(pathId)),
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
  runConcepts(pathId: string): Observable<PipelineResult> {
    return this.runStage('concepts', () => this.learningMapService.generateConcepts(pathId));
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

  /**
   * Build complete learning path structure:
   * 1. Generate concepts for the path
   * 2. Decompose each concept into sub-concepts
   * 3. Generate knowledge units for each sub-concept
   */
  buildCompleteLearningPath(pathId: string): Observable<PipelineResult> {
    this.reset();
    this.isRunning.set(true);

    return new Observable<PipelineResult>((subscriber) => {
      // Step 1: Generate concepts
      this.currentStage.set('concepts');
      this.currentProgress.set('Generating concepts...');

      this.learningMapService.generateConcepts(pathId, true).subscribe({
        next: (conceptResult) => {
          const concepts = conceptResult.concepts;
          this.completedStages.update(s => [...s, 'concepts']);
          subscriber.next({
            stage: 'concepts',
            success: true,
            message: `Generated ${concepts.length} concepts`,
            data: concepts,
          });

          if (concepts.length === 0) {
            this.isRunning.set(false);
            subscriber.complete();
            return;
          }

          // Step 2: Decompose each concept into sub-concepts
          this.currentStage.set('sub-concepts');
          const allSubConcepts: SubConcept[] = [];
          let conceptIndex = 0;

          const decomposeNext = () => {
            if (conceptIndex >= concepts.length) {
              // Done with all concepts
              this.completedStages.update(s => [...s, 'sub-concepts']);
              subscriber.next({
                stage: 'sub-concepts',
                success: true,
                message: `Generated ${allSubConcepts.length} sub-concepts from ${concepts.length} concepts`,
                data: allSubConcepts,
              });

              if (allSubConcepts.length === 0) {
                this.isRunning.set(false);
                subscriber.complete();
                return;
              }

              // Step 3: Generate KUs for each sub-concept
              this.currentStage.set('knowledge-units');
              let subConceptIndex = 0;
              let totalKUs = 0;

              const generateKUNext = () => {
                if (subConceptIndex >= allSubConcepts.length) {
                  // Done with all sub-concepts
                  this.completedStages.update(s => [...s, 'knowledge-units']);
                  subscriber.next({
                    stage: 'knowledge-units',
                    success: true,
                    message: `Generated ${totalKUs} knowledge units from ${allSubConcepts.length} sub-concepts`,
                  });
                  this.isRunning.set(false);
                  this.currentStage.set(null);
                  this.currentProgress.set('');
                  subscriber.complete();
                  return;
                }

                const subConcept = allSubConcepts[subConceptIndex];
                this.currentProgress.set(`Generating KUs for sub-concept ${subConceptIndex + 1}/${allSubConcepts.length}: ${subConcept.name}`);

                this.learningMapService.generateStructuredKU(subConcept.id).subscribe({
                  next: (kuResult) => {
                    totalKUs += kuResult.knowledgeUnits.length;
                    subConceptIndex++;
                    generateKUNext();
                  },
                  error: (err) => {
                    // Log error but continue with next sub-concept
                    console.error(`Failed to generate KUs for ${subConcept.name}:`, err);
                    subConceptIndex++;
                    generateKUNext();
                  },
                });
              };

              generateKUNext();
              return;
            }

            const concept = concepts[conceptIndex];
            this.currentProgress.set(`Decomposing concept ${conceptIndex + 1}/${concepts.length}: ${concept.name}`);

            this.learningMapService.decomposeConcept(concept.id).subscribe({
              next: (decomposeResult) => {
                allSubConcepts.push(...decomposeResult.subConcepts);
                conceptIndex++;
                decomposeNext();
              },
              error: (err) => {
                // Log error but continue with next concept
                console.error(`Failed to decompose ${concept.name}:`, err);
                conceptIndex++;
                decomposeNext();
              },
            });
          };

          decomposeNext();
        },
        error: (err) => {
          this.errorStage.set('concepts');
          this.lastError.set(err.error?.message || err.message || 'Failed to generate concepts');
          subscriber.next({
            stage: 'concepts',
            success: false,
            message: this.lastError() || 'Failed to generate concepts',
          });
          this.isRunning.set(false);
          subscriber.complete();
        },
      });
    });
  }
}
