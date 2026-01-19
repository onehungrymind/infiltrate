import { Injectable, inject } from '@angular/core';
import { Session, GenerateSessionDto } from '@kasita/common-models';
import { Action, ActionsSubject, Store } from '@ngrx/store';
import { GymnasiumActions } from './gymnasium.actions';
import {
  selectAllSessions,
  selectSessionsLoaded,
  selectSessionsLoading,
  selectSessionsGenerating,
  selectSessionsError,
  selectSelectedSession,
  selectTotalCount,
  selectSessionHtml,
  selectSessionsByDomain,
  selectPublicSessions,
  selectTemplates,
  selectTemplatesLoaded,
  selectDefaultTemplate,
} from './gymnasium.feature';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GymnasiumFacade {
  private readonly store = inject(Store);
  private readonly actions$ = inject(ActionsSubject);

  loaded$ = this.store.select(selectSessionsLoaded);
  loading$ = this.store.select(selectSessionsLoading);
  generating$ = this.store.select(selectSessionsGenerating);
  error$ = this.store.select(selectSessionsError);
  allSessions$ = this.store.select(selectAllSessions);
  selectedSession$ = this.store.select(selectSelectedSession);
  totalCount$ = this.store.select(selectTotalCount);
  publicSessions$ = this.store.select(selectPublicSessions);
  templates$ = this.store.select(selectTemplates);
  templatesLoaded$ = this.store.select(selectTemplatesLoaded);
  defaultTemplate$ = this.store.select(selectDefaultTemplate);

  mutations$ = this.actions$.pipe(
    filter(
      (action) =>
        action.type === GymnasiumActions.createSessionSuccess.type ||
        action.type === GymnasiumActions.updateSessionSuccess.type ||
        action.type === GymnasiumActions.deleteSessionSuccess.type ||
        action.type === GymnasiumActions.generateSessionSuccess.type,
    ),
  );

  generationSuccess$ = this.actions$.pipe(
    filter((action) => action.type === GymnasiumActions.generateSessionSuccess.type),
  );

  selectSessionsByDomain(domain: string) {
    return this.store.select(selectSessionsByDomain(domain));
  }

  selectSessionHtml(sessionId: string) {
    return this.store.select(selectSessionHtml(sessionId));
  }

  resetSelectedSession() {
    this.dispatch(GymnasiumActions.resetSelectedSession());
  }

  selectSession(selectedId: string) {
    this.dispatch(GymnasiumActions.selectSession({ selectedId }));
  }

  loadSessions() {
    this.dispatch(GymnasiumActions.loadSessions());
  }

  loadPublicSessions(limit?: number) {
    this.dispatch(GymnasiumActions.loadPublicSessions({ limit }));
  }

  loadSession(sessionId: string) {
    this.dispatch(GymnasiumActions.loadSession({ sessionId }));
  }

  renderSession(sessionId: string, templateId?: string) {
    this.dispatch(GymnasiumActions.renderSession({ sessionId, templateId }));
  }

  saveSession(session: Session) {
    if (session.id) {
      this.updateSession(session.id, session);
    } else {
      this.createSession(session);
    }
  }

  createSession(session: Partial<Session>) {
    this.dispatch(GymnasiumActions.createSession({ session }));
  }

  updateSession(id: string, changes: Partial<Session>) {
    this.dispatch(GymnasiumActions.updateSession({ id, changes }));
  }

  deleteSession(session: Session) {
    this.dispatch(GymnasiumActions.deleteSession({ session }));
  }

  publishSession(sessionId: string) {
    this.dispatch(GymnasiumActions.publishSession({ sessionId }));
  }

  unpublishSession(sessionId: string) {
    this.dispatch(GymnasiumActions.unpublishSession({ sessionId }));
  }

  generateSession(dto: GenerateSessionDto) {
    this.dispatch(GymnasiumActions.generateSession({ dto }));
  }

  loadTemplates() {
    this.dispatch(GymnasiumActions.loadTemplates());
  }

  loadDefaultTemplate() {
    this.dispatch(GymnasiumActions.loadDefaultTemplate());
  }

  dispatch(action: Action) {
    this.store.dispatch(action);
  }
}
