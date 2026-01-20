import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Project, ProjectConcept } from '@kasita/common-models';

export const ProjectsActions = createActionGroup({
  source: 'Projects API',
  events: {
    'Select Project': props<{ selectedId: string }>(),
    'Reset Selected Project': emptyProps(),
    'Reset Projects': emptyProps(),

    // Load all
    'Load Projects': emptyProps(),
    'Load Projects Success': props<{ projects: Project[] }>(),
    'Load Projects Failure': props<{ error: string | null }>(),

    // Load single
    'Load Project': props<{ projectId: string }>(),
    'Load Project Success': props<{ project: Project }>(),
    'Load Project Failure': props<{ error: string | null }>(),

    // Load by path
    'Load Projects By Path': props<{ pathId: string }>(),
    'Load Projects By Path Success': props<{ projects: Project[] }>(),
    'Load Projects By Path Failure': props<{ error: string | null }>(),

    // CRUD
    'Create Project': props<{ project: Project }>(),
    'Create Project Success': props<{ project: Project }>(),
    'Create Project Failure': props<{ error: string | null }>(),

    'Update Project': props<{ project: Project }>(),
    'Update Project Success': props<{ project: Project }>(),
    'Update Project Failure': props<{ error: string | null }>(),

    'Delete Project': props<{ project: Project }>(),
    'Delete Project Success': props<{ project: Project }>(),
    'Delete Project Failure': props<{ error: string | null }>(),

    // Concept linking
    'Link Concept': props<{ projectId: string; conceptId: string; weight: number }>(),
    'Link Concept Success': props<{ projectConcept: ProjectConcept }>(),
    'Link Concept Failure': props<{ error: string | null }>(),

    'Unlink Concept': props<{ projectId: string; conceptId: string }>(),
    'Unlink Concept Success': props<{ projectId: string; conceptId: string }>(),
    'Unlink Concept Failure': props<{ error: string | null }>(),
  },
});
