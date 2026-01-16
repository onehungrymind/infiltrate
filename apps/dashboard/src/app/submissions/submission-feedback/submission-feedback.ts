import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Feedback, ProjectGrade } from '@kasita/common-models';
import { MaterialModule } from '@kasita/material';
import { SubmissionsFacade } from '@kasita/core-state';

@Component({
  selector: 'app-submission-feedback',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './submission-feedback.html',
  styleUrl: './submission-feedback.scss',
})
export class SubmissionFeedback {
  private submissionsFacade = inject(SubmissionsFacade);

  @Input() submissionId = '';
  @Input() loading = false;
  @Input() grade: ProjectGrade | null = null;

  // Get feedback from the facade
  get feedback$() {
    return this.submissionsFacade.selectFeedbackForSubmission(this.submissionId);
  }

  getScoreColor(score: number): string {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  }

  getSourceIcon(source: string): string {
    return source === 'ai' ? 'smart_toy' : 'person';
  }

  getSourceLabel(source: string): string {
    return source === 'ai' ? 'AI Feedback' : 'Mentor Feedback';
  }

  formatDate(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatGrade(grade: ProjectGrade | null): string {
    if (!grade) return '';
    const gradeLabels: Record<ProjectGrade, string> = {
      'accepted': 'Accepted',
      'accepted_with_comments': 'Accepted with Comments',
      'needs_work': 'Needs Work',
    };
    return gradeLabels[grade] || grade;
  }

  getGradeColor(grade: ProjectGrade | null): string {
    if (!grade) return '#6b7280';
    const gradeColors: Record<ProjectGrade, string> = {
      'accepted': '#22c55e',
      'accepted_with_comments': '#f59e0b',
      'needs_work': '#ef4444',
    };
    return gradeColors[grade] || '#6b7280';
  }

  getGradeIcon(grade: ProjectGrade | null): string {
    if (!grade) return 'help';
    const gradeIcons: Record<ProjectGrade, string> = {
      'accepted': 'check_circle',
      'accepted_with_comments': 'info',
      'needs_work': 'error',
    };
    return gradeIcons[grade] || 'help';
  }
}
