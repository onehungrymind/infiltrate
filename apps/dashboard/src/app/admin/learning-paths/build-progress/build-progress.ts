import {
  Component,
  computed,
  effect,
  inject,
  input,
  OnDestroy,
  output,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BuildJobsFacade } from '@kasita/core-state';
import { MaterialModule } from '@kasita/material';

@Component({
  selector: 'app-build-progress',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './build-progress.html',
  styleUrl: './build-progress.scss',
})
export class BuildProgress implements OnDestroy {
  private buildJobsFacade = inject(BuildJobsFacade);

  // Input: path ID to track
  pathId = input.required<string>();

  // Output: emit when build completes
  buildComplete = output<void>();

  // NgRx state
  activeJob = toSignal(this.buildJobsFacade.activeJob$);
  isRunning = toSignal(this.buildJobsFacade.isRunning$, { initialValue: false });
  currentProgress = toSignal(this.buildJobsFacade.currentProgress$, { initialValue: 0 });
  latestEvent = toSignal(this.buildJobsFacade.latestEvent$);
  steps = toSignal(this.buildJobsFacade.steps$, { initialValue: [] });
  error = toSignal(this.buildJobsFacade.error$);

  // Local state for UI
  isExpanded = signal(false);

  // Computed values
  progressMessage = computed(() => {
    const event = this.latestEvent();
    if (!event) {
      const job = this.activeJob();
      return job?.currentOperation || 'Starting build...';
    }
    return event.message;
  });

  completedSteps = computed(() => {
    const job = this.activeJob();
    return job?.completedSteps || 0;
  });

  totalSteps = computed(() => {
    const job = this.activeJob();
    return job?.totalSteps || 0;
  });

  failedSteps = computed(() => {
    const job = this.activeJob();
    return job?.failedSteps || 0;
  });

  status = computed(() => {
    const job = this.activeJob();
    return job?.status || 'pending';
  });

  constructor() {
    // Load active job when path changes
    effect(() => {
      const pathId = this.pathId();
      if (pathId) {
        this.buildJobsFacade.loadActiveJob(pathId);
      }
    });

    // Subscribe to events when there's an active job
    effect(() => {
      const job = this.activeJob();
      if (job && (job.status === 'pending' || job.status === 'running')) {
        this.buildJobsFacade.subscribeToJobEvents(job.id);
      }
    });

    // Emit when build completes
    effect(() => {
      const event = this.latestEvent();
      if (event?.type === 'job-completed') {
        this.buildComplete.emit();
      }
    });
  }

  ngOnDestroy(): void {
    this.buildJobsFacade.unsubscribeFromJobEvents();
  }

  startBuild(): void {
    const pathId = this.pathId();
    if (pathId) {
      this.buildJobsFacade.createBuildJob(pathId);
    }
  }

  cancelBuild(): void {
    const job = this.activeJob();
    if (job) {
      this.buildJobsFacade.cancelJob(job.id);
    }
  }

  toggleExpanded(): void {
    this.isExpanded.update((v) => !v);
  }
}
