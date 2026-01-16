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

/* Principles */
import * as PrinciplesActions from './lib/principles/principles.actions';
import * as PrinciplesFeature from './lib/principles/principles.feature';
import * as PrinciplesEffects from './lib/principles/principles.effects';
import { PrincipleFacade } from './lib/principles/principles.facade';
import { principlesFeature } from './lib/principles/principles.feature';
import {
  loadPrinciples,
  loadPrinciple,
  loadPrinciplesByPath,
  createPrinciple,
  updatePrinciple,
  deletePrinciple,
} from './lib/principles/principles.effects';

export {
  principlesFeature,
  PrincipleFacade,
  PrinciplesActions,
  PrinciplesFeature,
  PrinciplesEffects,
  loadPrinciples,
  loadPrinciple,
  loadPrinciplesByPath,
  createPrinciple,
  updatePrinciple,
  deletePrinciple,
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

/* DataSources */
import * as DataSourcesActions from './lib/data-sources/data-sources.actions';
import * as DataSourcesFeature from './lib/data-sources/data-sources.feature';
import * as DataSourcesEffects from './lib/data-sources/data-sources.effects';
import { DataSourcesFacade } from './lib/data-sources/data-sources.facade';
import { dataSourcesFeature } from './lib/data-sources/data-sources.feature';
import {
  loadDataSources,
  loadDataSource,
  createDataSource,
  updateDataSource,
  deleteDataSource,
} from './lib/data-sources/data-sources.effects';

export {
  dataSourcesFeature,
  DataSourcesFacade,
  DataSourcesActions,
  DataSourcesFeature,
  DataSourcesEffects,
  loadDataSources,
  loadDataSource,
  createDataSource,
  updateDataSource,
  deleteDataSource,
};

/* Users */
import * as UsersActions from './lib/users/users.actions';
import * as UsersFeature from './lib/users/users.feature';
import * as UsersEffects from './lib/users/users.effects';
import { UsersFacade } from './lib/users/users.facade';
import { usersFeature } from './lib/users/users.feature';
import {
  loadUsers,
  loadUser,
  createUser,
  updateUser,
  deleteUser,
} from './lib/users/users.effects';

export {
  usersFeature,
  UsersFacade,
  UsersActions,
  UsersFeature,
  UsersEffects,
  loadUsers,
  loadUser,
  createUser,
  updateUser,
  deleteUser,
};

/* Submissions */
import * as SubmissionsActions from './lib/submissions/submissions.actions';
import * as SubmissionsFeature from './lib/submissions/submissions.feature';
import * as SubmissionsEffects from './lib/submissions/submissions.effects';
import { SubmissionsFacade } from './lib/submissions/submissions.facade';
import { submissionsFeature } from './lib/submissions/submissions.feature';
import {
  loadSubmissions,
  loadSubmission,
  loadSubmissionsByUser,
  loadSubmissionsByUnit,
  loadSubmissionsByPath,
  createSubmission,
  updateSubmission,
  deleteSubmission,
  submitForReview,
  requestAiFeedback,
  loadFeedback,
  loadMentorSubmissions,
  submitMentorFeedback,
} from './lib/submissions/submissions.effects';

export {
  submissionsFeature,
  SubmissionsFacade,
  SubmissionsActions,
  SubmissionsFeature,
  SubmissionsEffects,
  loadSubmissions,
  loadSubmission,
  loadSubmissionsByUser,
  loadSubmissionsByUnit,
  loadSubmissionsByPath,
  createSubmission,
  updateSubmission,
  deleteSubmission,
  submitForReview,
  requestAiFeedback,
  loadFeedback,
  loadMentorSubmissions,
  submitMentorFeedback,
};

/* Challenges */
import * as ChallengesActions from './lib/challenges/challenges.actions';
import * as ChallengesFeature from './lib/challenges/challenges.feature';
import * as ChallengesEffects from './lib/challenges/challenges.effects';
import { ChallengesFacade } from './lib/challenges/challenges.facade';
import { challengesFeature } from './lib/challenges/challenges.feature';
import {
  loadChallenges,
  loadChallenge,
  loadChallengesByUnit,
  createChallenge,
  updateChallenge,
  deleteChallenge,
} from './lib/challenges/challenges.effects';

export {
  challengesFeature,
  ChallengesFacade,
  ChallengesActions,
  ChallengesFeature,
  ChallengesEffects,
  loadChallenges,
  loadChallenge,
  loadChallengesByUnit,
  createChallenge,
  updateChallenge,
  deleteChallenge,
};

/* Projects */
import * as ProjectsActions from './lib/projects/projects.actions';
import * as ProjectsFeature from './lib/projects/projects.feature';
import * as ProjectsEffects from './lib/projects/projects.effects';
import { ProjectsFacade } from './lib/projects/projects.facade';
import { projectsFeature } from './lib/projects/projects.feature';
import {
  loadProjects,
  loadProject,
  loadProjectsByPath,
  createProject,
  updateProject,
  deleteProject,
  linkPrinciple,
  unlinkPrinciple,
} from './lib/projects/projects.effects';

export {
  projectsFeature,
  ProjectsFacade,
  ProjectsActions,
  ProjectsFeature,
  ProjectsEffects,
  loadProjects,
  loadProject,
  loadProjectsByPath,
  createProject,
  updateProject,
  deleteProject,
  linkPrinciple,
  unlinkPrinciple,
};
