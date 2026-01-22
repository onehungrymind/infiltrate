import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { combineLatest } from 'rxjs';
import { map, filter, take } from 'rxjs/operators';

import { EnrollmentsFacade, LearningPathsFacade, ConceptFacade, SubConceptsFacade } from '@kasita/core-state';
import { AuthService } from '@kasita/core-data';
import { Enrollment, LearningPath, Concept, SubConcept } from '@kasita/common-models';

interface ClassroomPathItem {
  learningPath: LearningPath;
  concepts: ClassroomConceptItem[];
}

interface ClassroomConceptItem {
  concept: Concept;
  subConcepts: ClassroomSubConceptItem[];
  expanded: boolean;
}

interface ClassroomSubConceptItem {
  subConcept: SubConcept;
  contentStatus: string;
}

@Component({
  selector: 'app-classroom-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="px-4 py-8 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Classroom
        </h1>
        <p class="mt-2 text-sm text-gray-600">
          Read and study your learning materials in a focused reading experience.
        </p>
      </div>

      <!-- Loading state -->
      @if (loading()) {
        <div class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      }

      <!-- Content -->
      @if (!loading()) {
        @if (paths().length === 0) {
          <div class="text-center py-12 bg-white rounded-xl border border-gray-200">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            <h3 class="mt-4 text-sm font-medium text-gray-900">No classroom content available</h3>
            <p class="mt-2 text-sm text-gray-500">
              Enroll in a learning path to access classroom content.
            </p>
            <a routerLink="/student/learning-paths"
              class="mt-4 inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500">
              Browse Learning Paths
              <svg class="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        }

        <!-- Learning Paths with Classroom Content -->
        <div class="space-y-6">
          @for (pathItem of paths(); track pathItem.learningPath.id) {
            <div class="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <!-- Path Header -->
              <div class="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-xs font-medium text-indigo-600 uppercase tracking-wide">
                      {{ pathItem.learningPath.domain }}
                    </p>
                    <h2 class="mt-1 text-lg font-semibold text-gray-900">
                      {{ pathItem.learningPath.name }}
                    </h2>
                  </div>
                  <div class="text-right">
                    <div class="text-sm font-medium text-gray-900">
                      {{ pathItem.concepts.length }} concepts
                    </div>
                  </div>
                </div>
              </div>

              <!-- Concepts -->
              <div class="divide-y divide-gray-100">
                @for (conceptItem of pathItem.concepts; track conceptItem.concept.id; let i = $index) {
                  <div>
                    <!-- Concept Header -->
                    <button (click)="toggleConcept(pathItem, i)"
                      class="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                      <div class="flex items-center gap-3">
                        <div class="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 text-sm font-medium">
                          {{ i + 1 }}
                        </div>
                        <div class="text-left">
                          <h3 class="font-medium text-gray-900">{{ conceptItem.concept.name }}</h3>
                          <p class="text-xs text-gray-500">{{ conceptItem.subConcepts.length }} topics</p>
                        </div>
                      </div>
                      <svg class="h-5 w-5 text-gray-400 transition-transform"
                        [class.rotate-180]="conceptItem.expanded"
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    <!-- Sub-concepts (expanded) -->
                    @if (conceptItem.expanded) {
                      <div class="bg-gray-50 px-4 pb-4">
                        <div class="space-y-2">
                          @for (subConceptItem of conceptItem.subConcepts; track subConceptItem.subConcept.id) {
                            <a [routerLink]="['/student/classroom', subConceptItem.subConcept.id]"
                              [queryParams]="{ concept: conceptItem.concept.name }"
                              class="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all">
                              <div class="flex items-center gap-3">
                                <svg class="h-5 w-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                                </svg>
                                <span class="text-sm font-medium text-gray-900">
                                  {{ subConceptItem.subConcept.name }}
                                </span>
                              </div>
                              <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                              </svg>
                            </a>
                          }

                          @if (conceptItem.subConcepts.length === 0) {
                            <p class="text-sm text-gray-500 italic p-3">No topics available</p>
                          }
                        </div>
                      </div>
                    }
                  </div>
                }

                @if (pathItem.concepts.length === 0) {
                  <div class="p-4 text-center text-sm text-gray-500">
                    No concepts defined for this learning path yet.
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `],
})
export class ClassroomList implements OnInit {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly enrollmentsFacade = inject(EnrollmentsFacade);
  private readonly learningPathsFacade = inject(LearningPathsFacade);
  private readonly conceptFacade = inject(ConceptFacade);
  private readonly subConceptsFacade = inject(SubConceptsFacade);

  readonly loading = signal(true);
  readonly paths = signal<ClassroomPathItem[]>([]);

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.loading.set(true);

    // Get current user
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.loading.set(false);
      return;
    }

    // Load all required data - use current user's enrollments only
    this.enrollmentsFacade.loadEnrollmentsByUser(currentUser.id);
    this.learningPathsFacade.loadLearningPaths();
    this.conceptFacade.loadConcepts();
    this.subConceptsFacade.loadSubConcepts();

    // Combine all data sources - also track loaded state
    combineLatest([
      this.enrollmentsFacade.allEnrollments$,
      this.learningPathsFacade.allLearningPaths$,
      this.conceptFacade.allConcepts$,
      this.subConceptsFacade.allSubConcepts$,
      this.enrollmentsFacade.loaded$,
      this.learningPathsFacade.loaded$,
      this.conceptFacade.loaded$,
      this.subConceptsFacade.loaded$,
    ]).pipe(
      // Wait until all data sources have been loaded
      filter(([enrollments, learningPaths, concepts, subConcepts, enrollmentsLoaded, pathsLoaded, conceptsLoaded, subConceptsLoaded]) =>
        enrollmentsLoaded && pathsLoaded && conceptsLoaded && subConceptsLoaded
      ),
      map(([enrollments, learningPaths, concepts, subConcepts]) => {
        // Get active enrollments
        const activeEnrollments = (enrollments || []).filter(
          (e: Enrollment) => e.status === 'active'
        );

        // Get unique path IDs from enrollments (deduplicate)
        const enrolledPathIds = [...new Set(activeEnrollments.map(e => e.pathId))];

        // Build path items for enrolled paths
        const pathItems: ClassroomPathItem[] = [];

        for (const pathId of enrolledPathIds) {
          const learningPath = (learningPaths || []).find(
            (lp: LearningPath) => lp.id === pathId
          );
          if (!learningPath) continue;

          const pathConcepts = (concepts || [])
            .filter((c: Concept) => c.pathId === learningPath.id)
            .sort((a: Concept, b: Concept) => a.order - b.order);

          const conceptItems: ClassroomConceptItem[] = pathConcepts.map(
            (concept: Concept) => {
              const conceptSubConcepts = (subConcepts || [])
                .filter((sc: SubConcept) => sc.conceptId === concept.id)
                .sort((a: SubConcept, b: SubConcept) => a.order - b.order);

              return {
                concept,
                subConcepts: conceptSubConcepts.map((sc: SubConcept) => ({
                  subConcept: sc,
                  contentStatus: 'ready',
                })),
                expanded: false,
              };
            }
          );

          pathItems.push({
            learningPath,
            concepts: conceptItems,
          });
        }

        return pathItems;
      }),
      take(1)
    ).subscribe({
      next: (pathItems) => {
        this.paths.set(pathItems);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load classroom data:', err);
        this.loading.set(false);
      },
    });
  }

  toggleConcept(pathItem: ClassroomPathItem, conceptIndex: number): void {
    this.paths.update(paths => {
      return paths.map(p => {
        if (p.learningPath.id === pathItem.learningPath.id) {
          const concepts = [...p.concepts];
          concepts[conceptIndex] = {
            ...concepts[conceptIndex],
            expanded: !concepts[conceptIndex].expanded,
          };
          return { ...p, concepts };
        }
        return p;
      });
    });
  }
}
