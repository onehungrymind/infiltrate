// Export state management features

/* LearningPaths */
import * as LearningPathsActions from './lib/learning-paths/learning-paths.actions';
import * as LearningPathsFeature from './lib/learning-paths/learning-paths.feature';
import * as LearningPathsEffects from './lib/learning-paths/learning-paths.effects';
import { LearningPathsFacade } from './lib/learning-paths/learning-paths.facade';
import { learningPathsFeature } from './lib/learning-paths/learning-paths.feature';
import {
  loadLearningPaths,
  loadLearningPath,
  createLearningPath,
  updateLearningPath,
  deleteLearningPath,
} from './lib/learning-paths/learning-paths.effects';

export {
  learningPathsFeature,
  LearningPathsFacade,
  LearningPathsActions,
  LearningPathsFeature,
  LearningPathsEffects,
  loadLearningPaths,
  loadLearningPath,
  createLearningPath,
  updateLearningPath,
  deleteLearningPath,
};

/* KnowledgeUnits */
import * as KnowledgeUnitsActions from './lib/knowledge-units/knowledge-units.actions';
import * as KnowledgeUnitsFeature from './lib/knowledge-units/knowledge-units.feature';
import * as KnowledgeUnitsEffects from './lib/knowledge-units/knowledge-units.effects';
import { KnowledgeUnitFacade } from './lib/knowledge-units/knowledge-units.facade';
import { knowledgeUnitsFeature } from './lib/knowledge-units/knowledge-units.feature';
import {
  loadKnowledgeUnits,
  loadKnowledgeUnit,
  createKnowledgeUnit,
  updateKnowledgeUnit,
  deleteKnowledgeUnit,
} from './lib/knowledge-units/knowledge-units.effects';

export {
  knowledgeUnitsFeature,
  KnowledgeUnitFacade,
  KnowledgeUnitsActions,
  KnowledgeUnitsFeature,
  KnowledgeUnitsEffects,
  loadKnowledgeUnits,
  loadKnowledgeUnit,
  createKnowledgeUnit,
  updateKnowledgeUnit,
  deleteKnowledgeUnit,
};

/* RawContent */
import * as RawContentActions from './lib/raw-content/raw-content.actions';
import * as RawContentFeature from './lib/raw-content/raw-content.feature';
import * as RawContentEffects from './lib/raw-content/raw-content.effects';
import { RawContentFacade } from './lib/raw-content/raw-content.facade';
import { rawContentFeature } from './lib/raw-content/raw-content.feature';
import {
  loadRawContent,
  loadRawContentItem,
  createRawContent,
  updateRawContent,
  deleteRawContent,
} from './lib/raw-content/raw-content.effects';

export {
  rawContentFeature,
  RawContentFacade,
  RawContentActions,
  RawContentFeature,
  RawContentEffects,
  loadRawContent,
  loadRawContentItem,
  createRawContent,
  updateRawContent,
  deleteRawContent,
};

/* SourceConfigs */
import * as SourceConfigsActions from './lib/source-configs/source-configs.actions';
import * as SourceConfigsFeature from './lib/source-configs/source-configs.feature';
import * as SourceConfigsEffects from './lib/source-configs/source-configs.effects';
import { SourceConfigFacade } from './lib/source-configs/source-configs.facade';
import { sourceConfigsFeature } from './lib/source-configs/source-configs.feature';
import {
  loadSourceConfigs,
  loadSourceConfig,
  createSourceConfig,
  updateSourceConfig,
  deleteSourceConfig,
} from './lib/source-configs/source-configs.effects';

export {
  sourceConfigsFeature,
  SourceConfigFacade,
  SourceConfigsActions,
  SourceConfigsFeature,
  SourceConfigsEffects,
  loadSourceConfigs,
  loadSourceConfig,
  createSourceConfig,
  updateSourceConfig,
  deleteSourceConfig,
};

/* UserProgress */
import * as UserProgressActions from './lib/user-progress/user-progress.actions';
import * as UserProgressFeature from './lib/user-progress/user-progress.feature';
import * as UserProgressEffects from './lib/user-progress/user-progress.effects';
import { UserProgressFacade } from './lib/user-progress/user-progress.facade';
import { userProgressFeature } from './lib/user-progress/user-progress.feature';
import {
  loadUserProgress,
  loadUserProgressItem,
  createUserProgress,
  updateUserProgress,
  deleteUserProgress,
} from './lib/user-progress/user-progress.effects';

export {
  userProgressFeature,
  UserProgressFacade,
  UserProgressActions,
  UserProgressFeature,
  UserProgressEffects,
  loadUserProgress,
  loadUserProgressItem,
  createUserProgress,
  updateUserProgress,
  deleteUserProgress,
};
