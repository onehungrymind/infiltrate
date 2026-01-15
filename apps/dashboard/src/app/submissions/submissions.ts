import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { LearningPath, Submission, Challenge, Project } from '@kasita/common-models';
import { SubmissionsFacade, LearningPathsFacade, ChallengesFacade, ProjectsFacade } from '@kasita/core-state';
import { SubmissionsService } from '@kasita/core-data';
import { MaterialModule } from '@kasita/material';
import { SubmissionDetail } from './submission-detail/submission-detail';
import { SubmissionsList } from './submissions-list/submissions-list';
import { SubmissionFeedback } from './submission-feedback/submission-feedback';
import {
  SearchFilterBar,
  FilterConfig,
  SearchFilterState,
} from '../shared/search-filter-bar/search-filter-bar';
import {
  filterEntities,
  commonFilterMatchers,
} from '../shared/search-filter-bar/filter-utils';

@Component({
  selector: 'app-submissions',
  imports: [
    SubmissionsList,
    SubmissionDetail,
    SubmissionFeedback,
    MaterialModule,
    SearchFilterBar,
  ],
  templateUrl: './submissions.html',
  styleUrl: './submissions.scss',
})
export class Submissions implements OnInit {
  private submissionsFacade = inject(SubmissionsFacade);
  private learningPathsFacade = inject(LearningPathsFacade);
  private challengesFacade = inject(ChallengesFacade);
  private projectsFacade = inject(ProjectsFacade);
  private submissionsService = inject(SubmissionsService);

  private allSubmissions = toSignal(this.submissionsFacade.allSubmissions$, {
    initialValue: [] as Submission[],
  });
  private allLearningPaths = toSignal(
    this.learningPathsFacade.allLearningPaths$,
    { initialValue: [] as LearningPath[] },
  );
  private allChallenges = toSignal(this.challengesFacade.allChallenges$, {
    initialValue: [] as Challenge[],
  });
  private allProjects = toSignal(this.projectsFacade.allProjects$, {
    initialValue: [] as Project[],
  });

  selectedSubmission = toSignal(this.submissionsFacade.selectedSubmission$, {
    initialValue: null,
  });
  loaded = toSignal(this.submissionsFacade.loaded$, { initialValue: false });
  error = toSignal(this.submissionsFacade.error$, { initialValue: null });
  feedbackLoading = toSignal(this.submissionsFacade.feedbackLoading$, {
    initialValue: false,
  });

  // Expose challenges and projects for the detail component
  challenges = computed(() => this.allChallenges());
  projects = computed(() => this.allProjects());

  // Track feedback for selected submission
  selectedSubmissionFeedback = computed(() => {
    const submission = this.selectedSubmission();
    if (!submission?.id) return [];
    return this.submissionsFacade.selectFeedbackForSubmission(submission.id);
  });

  // Search/Filter state
  searchFilterState = signal<SearchFilterState>({
    searchTerm: '',
    filters: {},
  });

  // Dynamic filter configuration based on loaded learning paths
  filterConfigs = computed<FilterConfig[]>(() => {
    const paths = this.allLearningPaths();
    const pathOptions = paths.map((p) => ({ label: p.name, value: p.id }));

    return [
      {
        field: 'pathId',
        label: 'Learning Path',
        options: pathOptions,
        fullWidth: true,
        row: 1,
      },
      {
        field: 'status',
        label: 'Status',
        options: [
          { label: 'Draft', value: 'draft' },
          { label: 'Submitted', value: 'submitted' },
          { label: 'Under Review', value: 'under_review' },
          { label: 'Approved', value: 'approved' },
          { label: 'Rejected', value: 'rejected' },
        ],
        row: 2,
      },
      {
        field: 'contentType',
        label: 'Content Type',
        options: [
          { label: 'Text / Code', value: 'text' },
          { label: 'URL Link', value: 'url' },
          { label: 'File Upload', value: 'file' },
        ],
        row: 2,
      },
    ];
  });

  // Filtered submissions
  submissions = computed(() => {
    const all = this.allSubmissions();
    const state = this.searchFilterState();
    return filterEntities(all, state, ['title', 'content'], {
      pathId: commonFilterMatchers.exactMatch<Submission>('pathId'),
      status: commonFilterMatchers.exactMatch<Submission>('status'),
      contentType: commonFilterMatchers.exactMatch<Submission>('contentType'),
    });
  });

  onSearchFilterChange(state: SearchFilterState) {
    this.searchFilterState.set(state);
  }

  constructor() {
    this.submissionsFacade.mutations$.subscribe(() => this.reset());
  }

  ngOnInit(): void {
    this.learningPathsFacade.loadLearningPaths();
    this.challengesFacade.loadChallenges();
    this.projectsFacade.loadProjects();
    this.reset();
  }

  reset() {
    this.loadSubmissions();
    this.submissionsFacade.resetSelectedSubmission();
  }

  selectSubmission(submission: Submission) {
    this.submissionsFacade.selectSubmission(submission.id as string);
    // Load feedback for the selected submission
    if (submission.id) {
      this.submissionsFacade.loadFeedback(submission.id);
    }
  }

  loadSubmissions() {
    this.submissionsFacade.loadSubmissions();
  }

  saveSubmission(submission: Submission) {
    this.submissionsFacade.saveSubmission(submission);
  }

  deleteSubmission(submission: Submission) {
    this.submissionsFacade.deleteSubmission(submission);
  }

  submitForReview(submissionId: string) {
    this.submissionsFacade.submitForReview(submissionId);
  }

  requestAiFeedback(submissionId: string) {
    this.submissionsFacade.requestAiFeedback(submissionId);
  }

  handleFileUpload(data: { file: File; title: string; challengeId?: string; projectId?: string }) {
    // TODO: Get current user ID from auth service
    const userId = 'demo-user-1';

    this.submissionsService.uploadFile(data.file, {
      userId,
      title: data.title,
      challengeId: data.challengeId,
      projectId: data.projectId,
    }).subscribe({
      next: () => {
        this.reset();
      },
      error: (err) => {
        console.error('File upload failed:', err);
      },
    });
  }

  cancel() {
    this.submissionsFacade.resetSelectedSubmission();
  }
}
