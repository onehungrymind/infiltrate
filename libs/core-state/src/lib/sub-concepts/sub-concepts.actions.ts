import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { SubConcept, KnowledgeUnit } from '@kasita/common-models';

export const SubConceptsActions = createActionGroup({
  source: 'SubConcepts API',
  events: {
    'Select SubConcept': props<{ selectedId: string }>(),
    'Reset Selected SubConcept': emptyProps(),
    'Reset SubConcepts': emptyProps(),
    'Load SubConcepts': emptyProps(),
    'Load SubConcepts Success': props<{ subConcepts: SubConcept[] }>(),
    'Load SubConcepts Failure': props<{ error: string | null }>(),
    'Load SubConcept': props<{ subConceptId: string }>(),
    'Load SubConcept Success': props<{ subConcept: SubConcept }>(),
    'Load SubConcept Failure': props<{ error: string | null }>(),
    'Load SubConcepts By Concept': props<{ conceptId: string }>(),
    'Load SubConcepts By Concept Success': props<{ subConcepts: SubConcept[] }>(),
    'Load SubConcepts By Concept Failure': props<{ error: string | null }>(),
    'Create SubConcept': props<{ subConcept: SubConcept }>(),
    'Create SubConcept Success': props<{ subConcept: SubConcept }>(),
    'Create SubConcept Failure': props<{ error: string | null }>(),
    'Update SubConcept': props<{ subConcept: SubConcept }>(),
    'Update SubConcept Success': props<{ subConcept: SubConcept }>(),
    'Update SubConcept Failure': props<{ error: string | null }>(),
    'Delete SubConcept': props<{ subConcept: SubConcept }>(),
    'Delete SubConcept Success': props<{ subConcept: SubConcept }>(),
    'Delete SubConcept Failure': props<{ error: string | null }>(),
    'Delete SubConcept Cancelled': emptyProps(),
    // AI generation actions
    'Decompose Concept': props<{ conceptId: string }>(),
    'Decompose Concept Success': props<{ subConcepts: SubConcept[]; message: string }>(),
    'Decompose Concept Failure': props<{ error: string | null }>(),
    'Generate Structured KU': props<{ subConceptId: string }>(),
    'Generate Structured KU Success': props<{ knowledgeUnit: KnowledgeUnit; message: string }>(),
    'Generate Structured KU Failure': props<{ error: string | null }>(),
    // Decoration actions
    'Add Decoration': props<{ subConceptId: string; knowledgeUnitId: string }>(),
    'Add Decoration Success': props<{ subConceptId: string; knowledgeUnitId: string }>(),
    'Add Decoration Failure': props<{ error: string | null }>(),
    'Remove Decoration': props<{ subConceptId: string; knowledgeUnitId: string }>(),
    'Remove Decoration Success': props<{ subConceptId: string; knowledgeUnitId: string }>(),
    'Remove Decoration Failure': props<{ error: string | null }>(),
  },
});
