import { CommonModule } from '@angular/common';
import { Component, computed,inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateMentorFeedbackDto, ProjectGrade, RubricScore,Submission } from '@kasita/common-models';
import { AuthService } from '@kasita/core-data';
import { SubmissionsFacade, UsersFacade } from '@kasita/core-state';
import { MaterialModule } from '@kasita/material';

import { FilterConfig,SearchFilterBar, SearchFilterState } from '../shared/search-filter-bar/search-filter-bar';

@Component({
  selector: 'app-mentor-dashboard',
  standalone: true,
  imports: [CommonModule, MaterialModule, FormsModule, ReactiveFormsModule, SearchFilterBar],
  templateUrl: './mentor-dashboard.html',
  styleUrl: './mentor-dashboard.scss',
})
export class MentorDashboard implements OnInit {
  private fb = inject(FormBuilder);
  private submissionsFacade = inject(SubmissionsFacade);
  private usersFacade = inject(UsersFacade);
  private authService = inject(AuthService);

  private get currentMentorId(): string {
    return this.authService.getCurrentUser()?.id || '';
  }

  mentorSubmissions = toSignal(this.submissionsFacade.mentorSubmissions$, {
    initialValue: [] as Submission[],
  });
  mentorSubmissionsLoaded = toSignal(this.submissionsFacade.mentorSubmissionsLoaded$, {
    initialValue: false,
  });
  error = toSignal(this.submissionsFacade.error$, { initialValue: null });

  selectedSubmission = signal<Submission | null>(null);
  isSubmitting = signal(false);

  // Search/Filter state
  searchFilterState = signal<SearchFilterState>({
    searchTerm: '',
    filters: {},
  });

  // Filter configuration
  filterConfigs = computed<FilterConfig[]>(() => [
    {
      field: 'status',
      label: 'Status',
      options: [
        { label: 'Submitted', value: 'submitted' },
        { label: 'Under Review', value: 'under_review' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
      ],
    },
    {
      field: 'type',
      label: 'Type',
      options: [
        { label: 'Challenge', value: 'challenge' },
        { label: 'Project', value: 'project' },
      ],
    },
  ]);

  // Default rubric criteria
  defaultRubricCriteria = [
    'Code Quality',
    'Functionality',
    'Documentation',
    'Best Practices',
  ];

  // Grade options for projects
  gradeOptions: { value: ProjectGrade; label: string; color: string }[] = [
    { value: 'accepted', label: 'Accepted', color: '#22c55e' },
    { value: 'accepted_with_comments', label: 'Accepted with Comments', color: '#f59e0b' },
    { value: 'needs_work', label: 'Needs Work', color: '#ef4444' },
  ];

  feedbackForm: FormGroup = this.fb.group({
    overallScore: [70, [Validators.required, Validators.min(0), Validators.max(100)]],
    content: ['', [Validators.required, Validators.minLength(10)]],
    suggestions: this.fb.array([this.fb.control('')]),
    rubricBreakdown: this.fb.array([]),
    grade: [''],
  });

  // Filtered submissions based on search and filters
  filteredSubmissions = computed(() => {
    const submissions = this.mentorSubmissions();
    const { searchTerm, filters } = this.searchFilterState();

    return submissions.filter((s) => {
      // Search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesSearch =
          s.title?.toLowerCase().includes(term) ||
          s.content?.toLowerCase().includes(term);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters['status'] && s.status !== filters['status']) {
        return false;
      }

      // Type filter
      if (filters['type']) {
        const isProject = !!s.projectId;
        const isChallenge = !!s.challengeId;
        if (filters['type'] === 'project' && !isProject) return false;
        if (filters['type'] === 'challenge' && !isChallenge) return false;
      }

      return true;
    });
  });

  // Track selected submission's feedback
  selectedSubmissionFeedback = computed(() => {
    const submission = this.selectedSubmission();
    if (!submission?.id) return [];
    return this.submissionsFacade.selectFeedbackForSubmission(submission.id);
  });

  get suggestionsArray(): FormArray {
    return this.feedbackForm.get('suggestions') as FormArray;
  }

  get rubricArray(): FormArray {
    return this.feedbackForm.get('rubricBreakdown') as FormArray;
  }

  ngOnInit(): void {
    this.loadSubmissions();
    this.initializeRubricBreakdown();
  }

  loadSubmissions() {
    this.submissionsFacade.loadMentorSubmissions(this.currentMentorId);
  }

  onSearchFilterChange(state: SearchFilterState) {
    this.searchFilterState.set(state);
  }

  selectSubmission(submission: Submission) {
    this.selectedSubmission.set(submission);
    this.resetForm();
    // Load feedback for the selected submission
    if (submission.id) {
      this.submissionsFacade.loadFeedback(submission.id);
    }
  }

  clearSelection() {
    this.selectedSubmission.set(null);
    this.resetForm();
  }

  private resetForm() {
    this.feedbackForm.reset({
      overallScore: 70,
      content: '',
      grade: '',
    });
    this.suggestionsArray.clear();
    this.suggestionsArray.push(this.fb.control(''));
    this.initializeRubricBreakdown();
  }

  private initializeRubricBreakdown() {
    this.rubricArray.clear();
    this.defaultRubricCriteria.forEach((criterion) => {
      this.rubricArray.push(
        this.fb.group({
          criterion: [criterion],
          achieved: [7, [Validators.required, Validators.min(0), Validators.max(10)]],
          maximum: [10],
          feedback: [''],
        })
      );
    });
  }

  addSuggestion() {
    this.suggestionsArray.push(this.fb.control(''));
  }

  removeSuggestion(index: number) {
    if (this.suggestionsArray.length > 1) {
      this.suggestionsArray.removeAt(index);
    }
  }

  calculateOverallScore() {
    const rubrics = this.rubricArray.value as RubricScore[];
    if (rubrics.length === 0) return;

    const totalAchieved = rubrics.reduce((sum, r) => sum + (r.achieved || 0), 0);
    const totalMaximum = rubrics.reduce((sum, r) => sum + (r.maximum || 10), 0);
    const score = Math.round((totalAchieved / totalMaximum) * 100);

    this.feedbackForm.patchValue({ overallScore: score });
  }

  submitFeedback() {
    if (!this.feedbackForm.valid || !this.selectedSubmission()?.id) {
      return;
    }

    const submission = this.selectedSubmission();
    const formValue = this.feedbackForm.value;

    // Filter out empty suggestions
    const suggestions = (formValue.suggestions || []).filter((s: string) => s.trim());

    const feedback: CreateMentorFeedbackDto = {
      overallScore: formValue.overallScore,
      rubricBreakdown: formValue.rubricBreakdown,
      suggestions,
      content: formValue.content,
    };

    // Only include grade for project submissions
    if (submission?.projectId && formValue.grade) {
      feedback.grade = formValue.grade as ProjectGrade;
    }

    this.isSubmitting.set(true);
    this.submissionsFacade.submitMentorFeedback(
      submission!.id!,
      this.currentMentorId,
      feedback
    );

    // Reset after a short delay to show success
    setTimeout(() => {
      this.isSubmitting.set(false);
      this.clearSelection();
      this.loadSubmissions();
    }, 1000);
  }

  isProjectSubmission(): boolean {
    const submission = this.selectedSubmission();
    return !!submission?.projectId;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'draft':
        return '#94a3b8';
      case 'submitted':
        return '#3b82f6';
      case 'under_review':
        return '#f59e0b';
      case 'approved':
        return '#22c55e';
      case 'rejected':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  }

  getStatusLabel(status: string): string {
    return status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  getScoreColor(score: number): string {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  }
}
