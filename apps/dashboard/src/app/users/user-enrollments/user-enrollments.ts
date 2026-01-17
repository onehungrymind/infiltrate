import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  Input,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { Enrollment, LearningPath, User } from '@kasita/common-models';
import { EnrollmentsService } from '@kasita/core-data';
import { EnrollmentsFacade, LearningPathsFacade, UsersFacade } from '@kasita/core-state';
import { MaterialModule } from '@kasita/material';

// Extended type for enrolled paths with enrollment data
interface EnrolledPath extends LearningPath {
  enrollment: Enrollment;
}

@Component({
  selector: 'app-user-enrollments',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './user-enrollments.html',
  styleUrl: './user-enrollments.scss',
})
export class UserEnrollments {
  private enrollmentsFacade = inject(EnrollmentsFacade);
  private learningPathsFacade = inject(LearningPathsFacade);
  private enrollmentsService = inject(EnrollmentsService);
  private usersFacade = inject(UsersFacade);

  private _user = signal<User | null>(null);

  // All learning paths
  private allLearningPaths = toSignal(this.learningPathsFacade.allLearningPaths$, {
    initialValue: [] as LearningPath[],
  });

  // All users (for mentor dropdown)
  allUsers = toSignal(this.usersFacade.allUsers$, {
    initialValue: [] as User[],
  });

  // User's enrollments
  private userEnrollments = toSignal(this.enrollmentsFacade.allEnrollments$, {
    initialValue: [],
  });

  // Loading state
  isLoading = signal(false);
  message = signal<{ type: 'success' | 'error'; text: string } | null>(null);

  // Track which path is currently saving mentor
  savingMentorForPath = signal<string | null>(null);

  // Local state for drag-drop lists
  availablePaths = signal<LearningPath[]>([]);
  enrolledPaths = signal<EnrolledPath[]>([]);

  @Input() set user(value: User | null) {
    this._user.set(value);
    if (value?.id) {
      this.loadData(value.id);
    }
  }

  get user(): User | null {
    return this._user();
  }

  constructor() {
    // Effect to update lists when data changes
    effect(() => {
      const user = this._user();
      const allPaths = this.allLearningPaths();
      const enrollments = this.userEnrollments();

      if (!user?.id || !allPaths.length) return;

      // Create a map of pathId -> enrollment for active enrollments
      const enrollmentMap = new Map(
        enrollments
          .filter((e) => e.userId === user.id && e.status === 'active')
          .map((e) => [e.pathId, e])
      );

      // Split paths into enrolled and available
      const enrolled: EnrolledPath[] = [];
      const available: LearningPath[] = [];

      for (const path of allPaths) {
        const enrollment = enrollmentMap.get(path.id);
        if (enrollment) {
          enrolled.push({ ...path, enrollment });
        } else {
          available.push(path);
        }
      }

      this.enrolledPaths.set(enrolled);
      this.availablePaths.set(available);
    });
  }

  private loadData(userId: string) {
    this.learningPathsFacade.loadLearningPaths();
    this.enrollmentsFacade.loadEnrollmentsByUser(userId);
    // Don't reload users - they're already loaded by the parent component
  }

  // Get mentor name for an enrolled path
  getMentorName(path: EnrolledPath): string {
    if (!path.enrollment?.mentorId) return '';
    const mentor = this.allUsers().find(u => u.id === path.enrollment.mentorId);
    return mentor ? (mentor.name || mentor.email) : '';
  }

  // Handle mentor selection change - auto-save to enrollment
  onMentorChange(path: EnrolledPath, mentorId: string | null) {
    const user = this._user();
    if (!user?.id) return;

    this.savingMentorForPath.set(path.id);
    this.message.set(null);

    // Update the enrollment's mentorId via the service (for immediate feedback)
    // Also update NgRx store via facade for persistence
    this.enrollmentsService.update(user.id, path.id, { mentorId }).subscribe({
      next: (updatedEnrollment) => {
        this.savingMentorForPath.set(null);

        // Update the local enrolled path data with the returned enrollment
        const enrolled = this.enrolledPaths();
        const updated = enrolled.map(p =>
          p.id === path.id
            ? { ...p, enrollment: updatedEnrollment }
            : p
        );
        this.enrolledPaths.set(updated as EnrolledPath[]);

        const mentorName = mentorId ? this.getMentorNameById(mentorId) : 'None';
        this.message.set({
          type: 'success',
          text: `Mentor for "${path.name}" set to ${mentorName}`,
        });

        // Clear message after 3 seconds
        setTimeout(() => this.message.set(null), 3000);
      },
      error: (err) => {
        this.savingMentorForPath.set(null);
        this.message.set({
          type: 'error',
          text: `Failed to assign mentor: ${err.message || 'Unknown error'}`,
        });
      },
    });
  }

  private getMentorNameById(mentorId: string): string {
    const mentor = this.allUsers().find(u => u.id === mentorId);
    return mentor ? (mentor.name || mentor.email) : 'Unknown';
  }

  onDrop(event: CdkDragDrop<(LearningPath | EnrolledPath)[]>) {
    const user = this._user();
    if (!user?.id) return;

    if (event.previousContainer === event.container) {
      // Reordering within the same list
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      // Moving between lists
      const item = event.previousContainer.data[event.previousIndex];

      // Determine if enrolling or unenrolling
      const isEnrolling = event.container.id === 'enrolled-list';

      // Perform API call
      this.isLoading.set(true);
      this.message.set(null);

      if (isEnrolling) {
        // Moving from available to enrolled
        const path = item as LearningPath;

        // Create a temporary enrollment for optimistic UI update
        const tempEnrollment: Enrollment = {
          id: 'temp-' + path.id,
          userId: user.id,
          pathId: path.id,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Update available list (remove from available)
        const newAvailable = [...this.availablePaths()];
        newAvailable.splice(event.previousIndex, 1);
        this.availablePaths.set(newAvailable);

        // Update enrolled list (add with enrollment data)
        const newEnrolled = [...this.enrolledPaths()];
        const enrolledPath: EnrolledPath = { ...path, enrollment: tempEnrollment };
        newEnrolled.splice(event.currentIndex, 0, enrolledPath);
        this.enrolledPaths.set(newEnrolled);

        this.enrollmentsFacade.enroll({
          userId: user.id,
          pathId: path.id,
        });
        this.message.set({
          type: 'success',
          text: `Enrolled in "${path.name}"`,
        });
      } else {
        // Moving from enrolled to available
        const enrolledPath = item as EnrolledPath;

        // Update enrolled list (remove from enrolled)
        const newEnrolled = [...this.enrolledPaths()];
        newEnrolled.splice(event.previousIndex, 1);
        this.enrolledPaths.set(newEnrolled);

        // Update available list (add as plain learning path)
        const newAvailable = [...this.availablePaths()];
        const { enrollment, ...plainPath } = enrolledPath;
        newAvailable.splice(event.currentIndex, 0, plainPath);
        this.availablePaths.set(newAvailable);

        this.enrollmentsFacade.unenroll(user.id, enrolledPath.id);
        this.message.set({
          type: 'success',
          text: `Unenrolled from "${enrolledPath.name}"`,
        });
      }

      this.isLoading.set(false);

      // Clear message after 3 seconds
      setTimeout(() => this.message.set(null), 3000);
    }
  }
}
