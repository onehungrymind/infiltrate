import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Session } from '@kasita/common-models';
import { MaterialModule } from '@kasita/material';

@Component({
  selector: 'app-sessions-list',
  imports: [MaterialModule],
  templateUrl: './sessions-list.html',
  styleUrl: './sessions-list.scss',
})
export class SessionsList {
  @Input() sessions: Session[] = [];
  @Input() selectedSession: Session | null = null;

  @Output() selected = new EventEmitter<Session>();
  @Output() deleted = new EventEmitter<Session>();

  isSelected(session: Session): boolean {
    return this.selectedSession?.id === session.id;
  }

  getDifficultyClass(difficulty: string): string {
    return `difficulty-${difficulty}`;
  }

  getVisibilityIcon(visibility: string): string {
    const icons: Record<string, string> = {
      public: 'public',
      private: 'lock',
      unlisted: 'link',
    };
    return icons[visibility] || 'help';
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }

  onDelete(event: MouseEvent, session: Session) {
    event.stopPropagation();
    this.deleted.emit(session);
  }
}
