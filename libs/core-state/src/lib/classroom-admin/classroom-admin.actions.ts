import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {
  ClassroomOverview,
  ClassroomContent,
  PathStatus,
  ContentListResponse,
  ContentListQuery,
  JobsResponse,
  GenerateResponse,
} from '@kasita/core-data';

export const ClassroomAdminActions = createActionGroup({
  source: 'Classroom Admin API',
  events: {
    // Overview
    'Load Overview': emptyProps(),
    'Load Overview Success': props<{ overview: ClassroomOverview }>(),
    'Load Overview Failure': props<{ error: string | null }>(),

    // Path Status
    'Load Path Status': props<{ learningPathId: string }>(),
    'Load Path Status Success': props<{ pathStatus: PathStatus }>(),
    'Load Path Status Failure': props<{ error: string | null }>(),

    // Content List
    'Load Content List': props<{ query?: ContentListQuery }>(),
    'Load Content List Success': props<{ response: ContentListResponse }>(),
    'Load Content List Failure': props<{ error: string | null }>(),

    // Single Content
    'Load Content': props<{ contentId: string }>(),
    'Load Content Success': props<{ content: ClassroomContent }>(),
    'Load Content Failure': props<{ error: string | null }>(),

    // Errors
    'Load Errors': emptyProps(),
    'Load Errors Success': props<{ errors: ClassroomContent[] }>(),
    'Load Errors Failure': props<{ error: string | null }>(),

    // Generate for Path
    'Generate For Path': props<{ learningPathId: string; force?: boolean }>(),
    'Generate For Path Success': props<{ response: GenerateResponse }>(),
    'Generate For Path Failure': props<{ error: string | null }>(),

    // Generate for Concept
    'Generate For Concept': props<{ conceptId: string }>(),
    'Generate For Concept Success': props<{ response: GenerateResponse }>(),
    'Generate For Concept Failure': props<{ error: string | null }>(),

    // Generate for SubConcept
    'Generate For Sub Concept': props<{ subConceptId: string; options?: { conceptName?: string; conceptId?: string; learningPathId?: string } }>(),
    'Generate For Sub Concept Success': props<{ response: GenerateResponse }>(),
    'Generate For Sub Concept Failure': props<{ error: string | null }>(),

    // Clear Path Content
    'Clear Path Content': props<{ learningPathId: string }>(),
    'Clear Path Content Success': props<{ learningPathId: string; deletedCount: number }>(),
    'Clear Path Content Failure': props<{ error: string | null }>(),

    // Update Content
    'Update Content': props<{ contentId: string; updates: { title?: string; summary?: string; sections?: any[] } }>(),
    'Update Content Success': props<{ content: ClassroomContent }>(),
    'Update Content Failure': props<{ error: string | null }>(),

    // Approve Content
    'Approve Content': props<{ contentId: string }>(),
    'Approve Content Success': props<{ content: ClassroomContent }>(),
    'Approve Content Failure': props<{ error: string | null }>(),

    // Regenerate Content
    'Regenerate Content': props<{ contentId: string }>(),
    'Regenerate Content Success': props<{ response: GenerateResponse }>(),
    'Regenerate Content Failure': props<{ error: string | null }>(),

    // Jobs
    'Load Jobs': emptyProps(),
    'Load Jobs Success': props<{ jobs: JobsResponse }>(),
    'Load Jobs Failure': props<{ error: string | null }>(),

    // Cancel Job
    'Cancel Job': props<{ jobId: string }>(),
    'Cancel Job Success': props<{ jobId: string }>(),
    'Cancel Job Failure': props<{ error: string | null }>(),

    // Select content for editing
    'Select Content': props<{ contentId: string | null }>(),

    // Reset state
    'Reset State': emptyProps(),
  },
});
