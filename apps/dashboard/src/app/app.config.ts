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
  sourceConfigsFeature,
  userProgressFeature,
  dataSourcesFeature,
  usersFeature,
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
  // Source Configs Effects
  loadSourceConfigs,
  loadSourceConfig,
  createSourceConfig,
  updateSourceConfig,
  deleteSourceConfig,
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
      sourceConfigs: sourceConfigsFeature.reducer,
      userProgress: userProgressFeature.reducer,
      dataSources: dataSourcesFeature.reducer,
      users: usersFeature.reducer,
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
      // Source Configs
      loadSourceConfigs,
      loadSourceConfig,
      createSourceConfig,
      updateSourceConfig,
      deleteSourceConfig,
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
    }),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      autoPause: true,
      trace: false,
      traceLimit: 75,
    }),
  ],
};
