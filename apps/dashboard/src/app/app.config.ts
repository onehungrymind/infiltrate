import {
  ApplicationConfig,
  ErrorHandler,
  isDevMode,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideSignalFormsConfig } from '@angular/forms/signals';
import { appRoutes } from './app.routes';
import { API_URL, authInterceptor, errorInterceptor, GlobalErrorHandler } from '@kasita/core-data';
import { environment } from '../environments/environment';
import {
  learningPathsFeature,
  knowledgeUnitsFeature,
  principlesFeature,
  rawContentFeature,
  userProgressFeature,
  dataSourcesFeature,
  usersFeature,
  submissionsFeature,
  challengesFeature,
  projectsFeature,
  // Learning Paths Effects
  loadLearningPaths,
  loadLearningPath,
  createLearningPath,
  updateLearningPath,
  deleteLearningPath,
  // Knowledge Units Effects
  loadKnowledgeUnits,
  loadKnowledgeUnit,
  createKnowledgeUnit,
  updateKnowledgeUnit,
  deleteKnowledgeUnit,
  // Principles Effects
  loadPrinciples,
  loadPrinciple,
  loadPrinciplesByPath,
  createPrinciple,
  updatePrinciple,
  deletePrinciple,
  // Raw Content Effects
  loadRawContent,
  loadRawContentItem,
  createRawContent,
  updateRawContent,
  deleteRawContent,
  // User Progress Effects
  loadUserProgress,
  loadUserProgressItem,
  createUserProgress,
  updateUserProgress,
  deleteUserProgress,
  // Data Sources Effects
  loadDataSources,
  loadDataSource,
  createDataSource,
  updateDataSource,
  deleteDataSource,
  // Users Effects
  loadUsers,
  loadUser,
  createUser,
  updateUser,
  deleteUser,
  // Submissions Effects
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
  // Challenges Effects
  loadChallenges,
  loadChallenge,
  loadChallengesByUnit,
  createChallenge,
  updateChallenge,
  deleteChallenge,
  // Projects Effects
  loadProjects,
  loadProject,
  loadProjectsByPath,
  createProject,
  updateProject,
  deleteProject,
  linkPrinciple,
  unlinkPrinciple,
} from '@kasita/core-state';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(), // Enable Angular animations (deprecated but still required for @ animations)
    provideRouter(appRoutes),
    provideHttpClient(withInterceptors([errorInterceptor, authInterceptor])),
    provideSignalFormsConfig({}),
    { provide: API_URL, useValue: environment.apiUrl },
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    // NgRx Store Configuration
    provideStore({
      learningPaths: learningPathsFeature.reducer,
      knowledgeUnits: knowledgeUnitsFeature.reducer,
      principles: principlesFeature.reducer,
      rawContent: rawContentFeature.reducer,
      userProgress: userProgressFeature.reducer,
      dataSources: dataSourcesFeature.reducer,
      users: usersFeature.reducer,
      submissions: submissionsFeature.reducer,
      challenges: challengesFeature.reducer,
      projects: projectsFeature.reducer,
    }),
    provideEffects({
      // Learning Paths
      loadLearningPaths,
      loadLearningPath,
      createLearningPath,
      updateLearningPath,
      deleteLearningPath,
      // Knowledge Units
      loadKnowledgeUnits,
      loadKnowledgeUnit,
      createKnowledgeUnit,
      updateKnowledgeUnit,
      deleteKnowledgeUnit,
      // Principles
      loadPrinciples,
      loadPrinciple,
      loadPrinciplesByPath,
      createPrinciple,
      updatePrinciple,
      deletePrinciple,
      // Raw Content
      loadRawContent,
      loadRawContentItem,
      createRawContent,
      updateRawContent,
      deleteRawContent,
      // User Progress
      loadUserProgress,
      loadUserProgressItem,
      createUserProgress,
      updateUserProgress,
      deleteUserProgress,
      // Data Sources
      loadDataSources,
      loadDataSource,
      createDataSource,
      updateDataSource,
      deleteDataSource,
      // Users
      loadUsers,
      loadUser,
      createUser,
      updateUser,
      deleteUser,
      // Submissions
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
      // Challenges
      loadChallenges,
      loadChallenge,
      loadChallengesByUnit,
      createChallenge,
      updateChallenge,
      deleteChallenge,
      // Projects
      loadProjects,
      loadProject,
      loadProjectsByPath,
      createProject,
      updateProject,
      deleteProject,
      linkPrinciple,
      unlinkPrinciple,
    }),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      autoPause: false, // Disabled to prevent issues with browser devtools open
      trace: false,
      traceLimit: 75,
    }),
  ],
};
