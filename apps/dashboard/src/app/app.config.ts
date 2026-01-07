import {
  ApplicationConfig,
  ErrorHandler,
  isDevMode,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
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
  rawContentFeature,
  sourceConfigsFeature,
  userProgressFeature,
  dataSourcesFeature,
  LearningPathsEffects,
  KnowledgeUnitsEffects,
  RawContentEffects,
  SourceConfigsEffects,
  UserProgressEffects,
  DataSourcesEffects,
} from '@kasita/core-state';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes),
    provideHttpClient(withInterceptors([errorInterceptor, authInterceptor])),
    provideSignalFormsConfig({}),
    { provide: API_URL, useValue: environment.apiUrl },
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    // NgRx Store Configuration
    provideStore({
      learningPaths: learningPathsFeature.reducer,
      knowledgeUnits: knowledgeUnitsFeature.reducer,
      rawContent: rawContentFeature.reducer,
      sourceConfigs: sourceConfigsFeature.reducer,
      userProgress: userProgressFeature.reducer,
      dataSources: dataSourcesFeature.reducer,
    }),
    provideEffects(
      LearningPathsEffects,
      KnowledgeUnitsEffects,
      RawContentEffects,
      SourceConfigsEffects,
      UserProgressEffects,
      DataSourcesEffects,
    ),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      autoPause: true,
      trace: false,
      traceLimit: 75,
    }),
  ],
};
