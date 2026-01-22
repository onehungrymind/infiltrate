import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Concept, KnowledgeUnit, LearningPath, SubConcept, UserProgress } from '@kasita/common-models';
import {
  ConceptFacade,
  KnowledgeUnitFacade,
  LearningPathsFacade,
  SubConceptsFacade,
  UserProgressFacade
} from '@kasita/core-state';
import { combineLatest, filter, map, take } from 'rxjs';

interface ConceptWithProgress {
  concept: Concept;
  subConcepts: SubConceptWithProgress[];
  progress: number;
  expanded: boolean;
}

interface SubConceptWithProgress {
  subConcept: SubConcept;
  knowledgeUnits: KnowledgeUnitWithProgress[];
  progress: number;
  expanded: boolean;
}

interface KnowledgeUnitWithProgress {
  unit: KnowledgeUnit;
  userProgress: UserProgress | null;
}

@Component({
  selector: 'app-learning-path-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './learning-path-detail.html',
  styleUrl: './learning-path-detail.scss',
})
export class LearningPathDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private learningPathsFacade = inject(LearningPathsFacade);
  private conceptFacade = inject(ConceptFacade);
  private subConceptsFacade = inject(SubConceptsFacade);
  private knowledgeUnitsFacade = inject(KnowledgeUnitFacade);
  private userProgressFacade = inject(UserProgressFacade);

  path = signal<LearningPath | null>(null);
  concepts = signal<ConceptWithProgress[]>([]);
  loading = signal(true);
  overallProgress = signal(0);

  ngOnInit(): void {
    const pathId = this.route.snapshot.paramMap.get('id');
    if (!pathId) {
      this.router.navigate(['/student/learning-paths']);
      return;
    }

    // Load all required data
    this.learningPathsFacade.loadLearningPath(pathId);
    this.conceptFacade.loadConceptsByPath(pathId);
    this.subConceptsFacade.loadSubConcepts();
    this.knowledgeUnitsFacade.loadKnowledgeUnits();
    this.userProgressFacade.loadUserProgress();

    // Get the learning path
    this.learningPathsFacade.selectedLearningPath$.pipe(
      filter((p): p is LearningPath => !!p),
      take(1),
    ).subscribe((path) => {
      this.path.set(path);
    });

    // Combine all data to build the curriculum tree
    combineLatest([
      this.conceptFacade.selectConceptsByPath(pathId),
      this.subConceptsFacade.allSubConcepts$,
      this.knowledgeUnitsFacade.allKnowledgeUnits$,
      this.userProgressFacade.allUserProgress$,
    ]).pipe(
      map(([concepts, allSubConcepts, allUnits, allProgress]) => {
        const conceptsWithProgress: ConceptWithProgress[] = concepts
          .sort((a: Concept, b: Concept) => a.order - b.order)
          .map((concept: Concept) => {
            const conceptSubConcepts = allSubConcepts.filter(
              (sc: SubConcept) => sc.conceptId === concept.id
            );

            const subConceptsWithProgress: SubConceptWithProgress[] = conceptSubConcepts
              .sort((a: SubConcept, b: SubConcept) => a.order - b.order)
              .map((subConcept: SubConcept) => {
                const subConceptUnits = allUnits.filter(
                  (u: KnowledgeUnit) => u.subConceptId === subConcept.id
                );

                const unitsWithProgress: KnowledgeUnitWithProgress[] = subConceptUnits
                  .map((unit: KnowledgeUnit) => ({
                    unit,
                    userProgress: allProgress.find((p: UserProgress) => p.unitId === unit.id) || null,
                  }));

                const masteredCount = unitsWithProgress.filter(
                  (u) => u.userProgress?.masteryLevel === 'mastered'
                ).length;
                const subConceptProgress = unitsWithProgress.length > 0
                  ? Math.round((masteredCount / unitsWithProgress.length) * 100)
                  : 0;

                return {
                  subConcept,
                  knowledgeUnits: unitsWithProgress,
                  progress: subConceptProgress,
                  expanded: false,
                };
              });

            const totalUnits = subConceptsWithProgress.reduce(
              (sum, sc) => sum + sc.knowledgeUnits.length, 0
            );
            const masteredUnits = subConceptsWithProgress.reduce(
              (sum, sc) => sum + sc.knowledgeUnits.filter(
                (u) => u.userProgress?.masteryLevel === 'mastered'
              ).length, 0
            );
            const conceptProgress = totalUnits > 0
              ? Math.round((masteredUnits / totalUnits) * 100)
              : 0;

            return {
              concept,
              subConcepts: subConceptsWithProgress,
              progress: conceptProgress,
              expanded: false,
            };
          });

        // Calculate overall progress
        const totalUnits = conceptsWithProgress.reduce(
          (sum, c) => sum + c.subConcepts.reduce(
            (s, sc) => s + sc.knowledgeUnits.length, 0
          ), 0
        );
        const masteredUnits = conceptsWithProgress.reduce(
          (sum, c) => sum + c.subConcepts.reduce(
            (s, sc) => s + sc.knowledgeUnits.filter(
              (u) => u.userProgress?.masteryLevel === 'mastered'
            ).length, 0
          ), 0
        );
        this.overallProgress.set(
          totalUnits > 0 ? Math.round((masteredUnits / totalUnits) * 100) : 0
        );

        return conceptsWithProgress;
      }),
    ).subscribe((conceptsWithProgress) => {
      this.concepts.set(conceptsWithProgress);
      this.loading.set(false);
    });
  }

  toggleConcept(index: number): void {
    this.concepts.update((concepts) => {
      const updated = [...concepts];
      updated[index] = { ...updated[index], expanded: !updated[index].expanded };
      return updated;
    });
  }

  toggleSubConcept(conceptIndex: number, subConceptIndex: number): void {
    this.concepts.update((concepts) => {
      const updated = [...concepts];
      const subConcepts = [...updated[conceptIndex].subConcepts];
      subConcepts[subConceptIndex] = {
        ...subConcepts[subConceptIndex],
        expanded: !subConcepts[subConceptIndex].expanded
      };
      updated[conceptIndex] = { ...updated[conceptIndex], subConcepts };
      return updated;
    });
  }

  studyConcept(conceptId: string): void {
    this.router.navigate(['/student/study/flashcards'], {
      queryParams: { conceptId }
    });
  }

  studySubConcept(subConceptId: string): void {
    this.router.navigate(['/student/study/flashcards'], {
      queryParams: { subConceptId }
    });
  }

  readSubConcept(subConceptId: string, conceptName: string): void {
    this.router.navigate(['/student/classroom', subConceptId], {
      queryParams: { concept: conceptName }
    });
  }

  goBack(): void {
    this.router.navigate(['/student/learning-paths']);
  }

  getDifficultyClass(difficulty: string): string {
    switch (difficulty) {
      case 'foundational':
        return 'bg-green-100 text-green-700';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-700';
      case 'advanced':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }

  getMasteryClass(masteryLevel: string | undefined): string {
    switch (masteryLevel) {
      case 'mastered':
        return 'bg-green-100 text-green-700';
      case 'reviewing':
        return 'bg-blue-100 text-blue-700';
      case 'learning':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }
}
