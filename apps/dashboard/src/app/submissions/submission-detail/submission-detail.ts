import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  EventEmitter,
  inject,
  Input,
  Output,
  signal,
} from '@angular/core';
import { Challenge, Project,Submission } from '@kasita/common-models';
import { SubmissionsService } from '@kasita/core-data';
import { MaterialModule } from '@kasita/material';

interface UrlMetadata {
  title?: string;
  description?: string;
  platform?: string;
  repoStats?: {
    stars?: number;
    language?: string;
    lastCommit?: Date;
  };
}

@Component({
  selector: 'app-submission-detail',
  imports: [CommonModule, MaterialModule],
  templateUrl: './submission-detail.html',
  styleUrl: './submission-detail.scss',
})
export class SubmissionDetail {
  private submissionsService = inject(SubmissionsService);

  private _submission = signal<Submission | null>(null);
  originalTitle = signal('');

  // Form fields
  title = signal('');
  contentType = signal<'text' | 'url' | 'file'>('text');
  content = signal('');
  url = signal('');
  selectedFile = signal<File | null>(null);
  challengeId = signal<string | null>(null);
  projectId = signal<string | null>(null);

  // URL metadata
  urlMetadata = signal<UrlMetadata | null>(null);
  isFetchingMetadata = signal(false);

  // Available challenges and projects (passed from parent)
  challenges = signal<Challenge[]>([]);
  projects = signal<Project[]>([]);

  @Input() set submission(value: Submission | null) {
    this._submission.set(value);
    if (value && value.id) {
      this.originalTitle.set(value.title || 'Submission');
      this.title.set(value.title || '');
      this.contentType.set((value.contentType as 'text' | 'url' | 'file') || 'text');
      this.content.set(value.contentType === 'text' ? value.content || '' : '');
      this.url.set(value.contentType === 'url' ? value.content || '' : '');
      this.challengeId.set(value.challengeId || null);
      this.projectId.set(value.projectId || null);
      this.urlMetadata.set(value.urlMetadata || null);
    } else {
      this.originalTitle.set('New Submission');
      this.title.set('');
      this.contentType.set('text');
      this.content.set('');
      this.url.set('');
      this.selectedFile.set(null);
      this.challengeId.set(null);
      this.projectId.set(null);
      this.urlMetadata.set(null);
    }
  }

  get submission(): Submission | null {
    return this._submission();
  }

  @Input() set availableChallenges(value: Challenge[]) {
    this.challenges.set(value || []);
  }

  @Input() set availableProjects(value: Project[]) {
    this.projects.set(value || []);
  }

  @Output() saved = new EventEmitter<Submission>();
  @Output() cancelled = new EventEmitter<void>();
  @Output() submitForReview = new EventEmitter<string>();
  @Output() requestFeedback = new EventEmitter<string>();
  @Output() fileUploaded = new EventEmitter<{ file: File; title: string; challengeId?: string; projectId?: string }>();

  canSubmitForReview = computed(() => {
    const sub = this._submission();
    return sub?.id && sub.status === 'draft';
  });

  canRequestFeedback = computed(() => {
    const sub = this._submission();
    return sub?.id && sub.status !== 'draft';
  });

  isFormValid = computed(() => {
    if (!this.title().trim()) return false;

    switch (this.contentType()) {
      case 'text':
        return this.content().trim().length > 0;
      case 'url':
        return this.isValidUrl(this.url());
      case 'file':
        return this.selectedFile() !== null || (this._submission()?.contentType === 'file' && this._submission()?.content);
      default:
        return false;
    }
  });

  onContentTypeChange(value: string) {
    this.contentType.set(value as 'text' | 'url' | 'file');
    // Clear other content when switching types
    if (value !== 'text') this.content.set('');
    if (value !== 'url') {
      this.url.set('');
      this.urlMetadata.set(null);
    }
    if (value !== 'file') this.selectedFile.set(null);
  }

  onChallengeChange(value: string) {
    this.challengeId.set(value || null);
    if (value) this.projectId.set(null); // Clear project if challenge selected
  }

  onProjectChange(value: string) {
    this.projectId.set(value || null);
    if (value) this.challengeId.set(null); // Clear challenge if project selected
  }

  async fetchMetadata() {
    const urlValue = this.url();
    if (!this.isValidUrl(urlValue)) return;

    this.isFetchingMetadata.set(true);
    try {
      const metadata = await this.submissionsService.fetchUrlMetadata(urlValue).toPromise();
      this.urlMetadata.set(metadata || null);
    } catch (error) {
      console.error('Failed to fetch URL metadata:', error);
      this.urlMetadata.set(null);
    } finally {
      this.isFetchingMetadata.set(false);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile.set(input.files[0]);
    }
  }

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.selectedFile.set(event.dataTransfer.files[0]);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  removeFile() {
    this.selectedFile.set(null);
  }

  onSubmit(event: Event) {
    event.preventDefault();
    if (!this.isFormValid()) return;

    const currentSubmission = this.submission;
    const contentTypeValue = this.contentType();

    // Handle file upload separately
    if (contentTypeValue === 'file' && this.selectedFile()) {
      this.fileUploaded.emit({
        file: this.selectedFile()!,
        title: this.title(),
        challengeId: this.challengeId() || undefined,
        projectId: this.projectId() || undefined,
      });
      return;
    }

    const entity: Submission = {
      title: this.title(),
      contentType: contentTypeValue,
      content: contentTypeValue === 'url' ? this.url() : this.content(),
      challengeId: this.challengeId() || undefined,
      projectId: this.projectId() || undefined,
      urlMetadata: contentTypeValue === 'url' ? this.urlMetadata() || undefined : undefined,
      ...(currentSubmission?.id
        ? {
            id: currentSubmission.id,
            userId: currentSubmission.userId,
            unitId: currentSubmission.unitId,
            pathId: currentSubmission.pathId,
            status: currentSubmission.status,
            score: currentSubmission.score,
            submittedAt: currentSubmission.submittedAt,
            reviewedAt: currentSubmission.reviewedAt,
            createdAt: currentSubmission.createdAt,
            updatedAt: currentSubmission.updatedAt,
          }
        : {
            userId: '',
            status: 'draft',
          }),
    } as Submission;

    this.saved.emit(entity);
  }

  onCancel() {
    this.cancelled.emit();
  }

  onSubmitForReview() {
    const sub = this._submission();
    if (sub?.id) {
      this.submitForReview.emit(sub.id);
    }
  }

  onRequestFeedback() {
    const sub = this._submission();
    if (sub?.id) {
      this.requestFeedback.emit(sub.id);
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'draft': return '#6b7280';
      case 'submitted': return '#3b82f6';
      case 'under_review': return '#f59e0b';
      case 'approved': return '#22c55e';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  }

  formatStatus(status: string): string {
    return status.replace('_', ' ');
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  getPlatformIcon(platform: string): string {
    switch (platform) {
      case 'github': return 'code';
      case 'codepen': return 'brush';
      case 'codesandbox': return 'web';
      default: return 'link';
    }
  }
}
