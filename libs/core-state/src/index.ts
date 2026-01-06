// Export state management features

/* LearningPaths */
import * as LearningPathsActions from './lib/learning-paths/learning-paths.actions';
import * as LearningPathsFeature from './lib/learning-paths/learning-paths.feature';
import * as LearningPathsEffects from './lib/learning-paths/learning-paths.effects';
import { LearningPathsFacade } from './lib/learning-paths/learning-paths.facade';
import { learningPathsFeature } from './lib/learning-paths/learning-paths.feature';

export {
  learningPathsFeature,
  LearningPathsFacade,
  LearningPathsActions,
  LearningPathsFeature,
  LearningPathsEffects,
};

/* KnowledgeUnits */
import * as KnowledgeUnitsActions from './lib/knowledge-units/knowledge-units.actions';
import * as KnowledgeUnitsFeature from './lib/knowledge-units/knowledge-units.feature';
import * as KnowledgeUnitsEffects from './lib/knowledge-units/knowledge-units.effects';
import { KnowledgeUnitsFacade } from './lib/knowledge-units/knowledge-units.facade';
import { knowledgeUnitsFeature } from './lib/knowledge-units/knowledge-units.feature';

export {
  knowledgeUnitsFeature,
  KnowledgeUnitsFacade,
  KnowledgeUnitsActions,
  KnowledgeUnitsFeature,
  KnowledgeUnitsEffects,
};

/* RawContent */
import * as RawContentActions from './lib/raw-content/raw-content.actions';
import * as RawContentFeature from './lib/raw-content/raw-content.feature';
import * as RawContentEffects from './lib/raw-content/raw-content.effects';
import { RawContentFacade } from './lib/raw-content/raw-content.facade';
import { rawContentFeature } from './lib/raw-content/raw-content.feature';

export {
  rawContentFeature,
  RawContentFacade,
  RawContentActions,
  RawContentFeature,
  RawContentEffects,
};

/* SourceConfigs */
import * as SourceConfigsActions from './lib/source-configs/source-configs.actions';
import * as SourceConfigsFeature from './lib/source-configs/source-configs.feature';
import * as SourceConfigsEffects from './lib/source-configs/source-configs.effects';
import { SourceConfigsFacade } from './lib/source-configs/source-configs.facade';
import { sourceConfigsFeature } from './lib/source-configs/source-configs.feature';

export {
  sourceConfigsFeature,
  SourceConfigsFacade,
  SourceConfigsActions,
  SourceConfigsFeature,
  SourceConfigsEffects,
};

/* UserProgress */
import * as UserProgressActions from './lib/user-progress/user-progress.actions';
import * as UserProgressFeature from './lib/user-progress/user-progress.feature';
import * as UserProgressEffects from './lib/user-progress/user-progress.effects';
import { UserProgressFacade } from './lib/user-progress/user-progress.facade';
import { userProgressFeature } from './lib/user-progress/user-progress.feature';

export {
  userProgressFeature,
  UserProgressFacade,
  UserProgressActions,
  UserProgressFeature,
  UserProgressEffects,
};
