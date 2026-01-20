import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Enrollment, LearningPath } from '@kasita/common-models';
import { AuthService } from '@kasita/core-data';
import { EnrollmentsFacade, LearningPathsFacade, UserProgressFacade } from '@kasita/core-state';
import { combineLatest, map } from 'rxjs';

interface EnrolledPath {
  enrollment: Enrollment;
  path: LearningPath;
  progress: number;
}

@Component({
  selector: 'app-learning-paths-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './learning-paths-list.html',
  styleUrl: './learning-paths-list.scss',
})
export class LearningPathsList implements OnInit {
  private enrollmentsFacade = inject(EnrollmentsFacade);
  private learningPathsFacade = inject(LearningPathsFacade);
  private userProgressFacade = inject(UserProgressFacade);
  private authService = inject(AuthService);
  private router = inject(Router);

  enrolledPaths = signal<EnrolledPath[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (!userId) {
      this.loading.set(false);
      return;
    }

    this.enrollmentsFacade.loadEnrollmentsByUser(userId);
    this.learningPathsFacade.loadLearningPaths();
    this.userProgressFacade.loadUserProgress();

    combineLatest([
      this.enrollmentsFacade.selectEnrollmentsByUser(userId),
      this.learningPathsFacade.allLearningPaths$,
      this.userProgressFacade.allUserProgress$,
    ]).pipe(
      map(([enrollments, paths, progress]) => {
        return enrollments
          .filter((e: Enrollment) => e.status === 'active')
          .map((enrollment: Enrollment) => {
            const path = paths.find((p: LearningPath) => p.id === enrollment.pathId);
            if (!path) return null;

            // Calculate progress based on user progress entries
            const pathProgress = progress.filter((p) => {
              // This is a simplified calculation
              return p.masteryLevel === 'mastered';
            });
            const progressPercent = 0; // Will be calculated with proper data

            return {
              enrollment,
              path,
              progress: progressPercent,
            };
          })
          .filter((ep): ep is EnrolledPath => ep !== null);
      }),
    ).subscribe((enrolledPaths) => {
      this.enrolledPaths.set(enrolledPaths);
      this.loading.set(false);
    });
  }

  viewPath(pathId: string): void {
    this.router.navigate(['/student/learning-paths', pathId]);
  }

  continueLearning(pathId: string): void {
    this.router.navigate(['/student/study/flashcards'], { queryParams: { pathId } });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'completed':
        return 'bg-blue-100 text-blue-700';
      case 'dropped':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }
}
