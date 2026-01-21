import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Enrollment, LearningPath } from '@kasita/common-models';
import { AuthService } from '@kasita/core-data';
import { EnrollmentsFacade, LearningPathsFacade } from '@kasita/core-state';
import { combineLatest, map } from 'rxjs';

interface EnrolledPathCard {
  enrollment: Enrollment;
  path: LearningPath;
  stats: {
    conceptsCount: number;
    progress: number;
    dueToday: number;
  };
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private enrollmentsFacade = inject(EnrollmentsFacade);
  private learningPathsFacade = inject(LearningPathsFacade);
  private authService = inject(AuthService);
  private router = inject(Router);

  enrolledPaths = signal<EnrolledPathCard[]>([]);
  loading = signal(true);
  userName = computed(() => this.authService.currentUser()?.name || 'Learner');

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (!userId) {
      this.loading.set(false);
      return;
    }

    this.enrollmentsFacade.loadEnrollmentsByUser(userId);
    this.learningPathsFacade.loadLearningPaths();

    combineLatest([
      this.enrollmentsFacade.selectEnrollmentsByUser(userId),
      this.learningPathsFacade.allLearningPaths$,
    ]).pipe(
      map(([enrollments, paths]) => {
        return enrollments
          .filter((e: Enrollment) => e.status === 'active')
          .map((enrollment: Enrollment) => {
            const path = paths.find((p: LearningPath) => p.id === enrollment.pathId);
            if (!path) return null;

            return {
              enrollment,
              path,
              stats: {
                conceptsCount: 0, // Will be populated with real data
                progress: 0,
                dueToday: 0,
              },
            };
          })
          .filter((ep): ep is EnrolledPathCard => ep !== null);
      }),
    ).subscribe((enrolledPaths) => {
      this.enrolledPaths.set(enrolledPaths);
      this.loading.set(false);
    });
  }

  viewPath(pathId: string): void {
    this.router.navigate(['/student/learning-paths', pathId]);
  }

  studyPath(pathId: string): void {
    this.router.navigate(['/student/study/flashcards'], { queryParams: { pathId } });
  }

  viewAllPaths(): void {
    this.router.navigate(['/student/learning-paths']);
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

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }
}
