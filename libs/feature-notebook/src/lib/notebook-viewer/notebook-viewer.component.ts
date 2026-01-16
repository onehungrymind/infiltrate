import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthService, NotebooksService, SubmitNotebookRequest } from '@kasita/core-data';
import { MaterialModule } from '@kasita/material';

@Component({
  selector: 'lib-notebook-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './notebook-viewer.component.html',
  styleUrl: './notebook-viewer.component.scss',
})
export class NotebookViewerComponent implements OnInit {
  private notebooksService = inject(NotebooksService);
  private authService = inject(AuthService);
  private sanitizer = inject(DomSanitizer);

  notebookId = 'pandas_exercises';
  marimoUrl = 'http://localhost:2718'; // Marimo server URL
  safeMarimoUrl: SafeResourceUrl;
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  progress = signal<any>(null);

  constructor() {
    // Sanitize the URL for use in iframe
    this.safeMarimoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.marimoUrl);
  }

  ngOnInit(): void {
    this.loadProgress();
  }

  loadProgress(): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    this.notebooksService.getNotebookProgress(user.id, this.notebookId).subscribe({
      next: (progress) => {
        // progress will be null if no progress exists yet (404 handled in service)
        this.progress.set(progress);
      },
      error: (err) => {
        // Only log unexpected errors (404s are handled in service)
        console.error('Error loading progress:', err);
      },
    });
  }

  saveProgress(): void {
    // In a real implementation, this would extract code from the iframe
    // For now, we'll show a message
    this.success.set('Progress saved! (Note: Full implementation requires iframe communication)');
    setTimeout(() => this.success.set(null), 3000);
  }

  submitForEvaluation(): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.error.set('User not authenticated');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);

    // In a real implementation, extract notebook code from Marimo iframe
    // For now, we'll use a placeholder
    const request: SubmitNotebookRequest = {
      notebookId: this.notebookId,
      notebookCode: '# Notebook code would be extracted from Marimo here',
      userId: user.id,
      completedExercises: this.progress()?.completedExercises || [],
    };

    this.notebooksService.submitNotebook(request).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.success.set(`Submitted successfully! Completed ${response.completedExercises.length}/5 exercises.`);
        this.loadProgress();
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Failed to submit notebook');
      },
    });
  }
}
