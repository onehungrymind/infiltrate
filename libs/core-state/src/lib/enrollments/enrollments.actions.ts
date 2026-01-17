import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Enrollment, CreateEnrollmentDto, UpdateEnrollmentDto } from '@kasita/common-models';

export const EnrollmentsActions = createActionGroup({
  source: 'Enrollments API',
  events: {
    'Select Enrollment': props<{ selectedId: string }>(),
    'Reset Selected Enrollment': emptyProps(),
    'Reset Enrollments': emptyProps(),

    // Load all
    'Load Enrollments': emptyProps(),
    'Load Enrollments Success': props<{ enrollments: Enrollment[] }>(),
    'Load Enrollments Failure': props<{ error: string | null }>(),

    // Load by user
    'Load Enrollments By User': props<{ userId: string }>(),
    'Load Enrollments By User Success': props<{ enrollments: Enrollment[] }>(),
    'Load Enrollments By User Failure': props<{ error: string | null }>(),

    // Load by path
    'Load Enrollments By Path': props<{ pathId: string; activeOnly?: boolean }>(),
    'Load Enrollments By Path Success': props<{ enrollments: Enrollment[] }>(),
    'Load Enrollments By Path Failure': props<{ error: string | null }>(),

    // Check enrollment
    'Check Enrollment': props<{ userId: string; pathId: string }>(),
    'Check Enrollment Success': props<{ isEnrolled: boolean; enrollment: Enrollment | null }>(),
    'Check Enrollment Failure': props<{ error: string | null }>(),

    // Enroll
    'Enroll': props<{ enrollment: CreateEnrollmentDto }>(),
    'Enroll Success': props<{ enrollment: Enrollment }>(),
    'Enroll Failure': props<{ error: string | null }>(),

    // Update enrollment
    'Update Enrollment': props<{ userId: string; pathId: string; updateDto: UpdateEnrollmentDto }>(),
    'Update Enrollment Success': props<{ enrollment: Enrollment }>(),
    'Update Enrollment Failure': props<{ error: string | null }>(),

    // Unenroll
    'Unenroll': props<{ userId: string; pathId: string }>(),
    'Unenroll Success': props<{ userId: string; pathId: string }>(),
    'Unenroll Failure': props<{ error: string | null }>(),

    // Leaderboard
    'Load Leaderboard': props<{ pathId: string }>(),
    'Load Leaderboard Success': props<{ pathId: string; leaderboard: any[] }>(),
    'Load Leaderboard Failure': props<{ error: string | null }>(),
  },
});
