import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthService, NotebookProgress, NotebooksService } from '@kasita/core-data';
import { MaterialModule } from '@kasita/material';

@Component({
  selector: 'lib-notebook-progress',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './notebook-progress.component.html',
  styleUrl: './notebook-progress.component.scss',
})
export class NotebookProgressComponent implements OnInit {
  private notebooksService = inject(NotebooksService);
  private authService = inject(AuthService);

  progressList = signal<NotebookProgress[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadProgress();
  }

  loadProgress(): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.error.set('User not authenticated');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.notebooksService.getUserProgress(user.id).subscribe({
      next: (progress) => {
        this.progressList.set(progress);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load progress');
        this.loading.set(false);
      },
    });
  }

  getExerciseStatus(progress: NotebookProgress, exerciseNum: number): 'complete' | 'in-progress' | 'not-started' {
    if (progress.completedExercises.includes(exerciseNum)) {
      return 'complete';
    }
    // Check if any previous exercise is complete (in progress)
    if (progress.completedExercises.length > 0 && exerciseNum <= Math.max(...progress.completedExercises) + 1) {
      return 'in-progress';
    }
    return 'not-started';
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'complete':
        return 'check_circle';
      case 'in-progress':
        return 'pending';
      default:
        return 'radio_button_unchecked';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'complete':
        return 'primary';
      case 'in-progress':
        return 'accent';
      default:
        return '';
    }
  }
}
