import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  isDevMode,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { appRoutes } from './app.routes';
import { API_URL } from '@kasita/core-data';
import { environment } from '../environments/environment';
import {
  learningPathsFeature,
  knowledgeUnitsFeature,
  rawContentFeature,
  sourceConfigsFeature,
  userProgressFeature,
  LearningPathsEffects,
  KnowledgeUnitsEffects,
  RawContentEffects,
  SourceConfigsEffects,
  UserProgressEffects,
} from '@kasita/core-state';
import { authInterceptor } from '@kasita/core-data';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: API_URL, useValue: environment.apiUrl },
    // NgRx Store Configuration
    provideStore({
      learningPaths: learningPathsFeature.reducer,
      knowledgeUnits: knowledgeUnitsFeature.reducer,
      rawContent: rawContentFeature.reducer,
      sourceConfigs: sourceConfigsFeature.reducer,
      userProgress: userProgressFeature.reducer,
    }),
    provideEffects(
      LearningPathsEffects,
      KnowledgeUnitsEffects,
      RawContentEffects,
      SourceConfigsEffects,
      UserProgressEffects,
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
