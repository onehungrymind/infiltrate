import {
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  signal,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Session, SessionVisibility } from '@kasita/common-models';
import { GymnasiumFacade } from '@kasita/core-state';
import { MaterialModule } from '@kasita/material';
import { take } from 'rxjs';

@Component({
  selector: 'app-session-viewer',
  imports: [MaterialModule, FormsModule],
  templateUrl: './session-viewer.html',
  styleUrl: './session-viewer.scss',
})
export class SessionViewer implements OnChanges {
  private gymnasiumFacade = inject(GymnasiumFacade);

  @Input() session: Session | null = null;
  @Output() sessionUpdated = new EventEmitter<void>();
  @ViewChild('iframeContainer') iframeContainer!: ElementRef<HTMLDivElement>;

  loading = signal(false);
  saving = signal(false);

  // Editable fields
  editSlug = '';
  editVisibility: SessionVisibility = 'private';

  visibilityOptions: { value: SessionVisibility; label: string; icon: string }[] = [
    { value: 'private', label: 'Private', icon: 'lock' },
    { value: 'unlisted', label: 'Unlisted', icon: 'link' },
    { value: 'public', label: 'Public', icon: 'public' },
  ];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['session'] && this.session) {
      // Reset form fields when session changes
      this.editSlug = this.session.slug || '';
      this.editVisibility = this.session.visibility || 'private';
      this.loadRenderedHtml(this.session.id);
    }
  }

  get isDirty(): boolean {
    if (!this.session) return false;
    return (
      this.editSlug !== (this.session.slug || '') ||
      this.editVisibility !== (this.session.visibility || 'private')
    );
  }

  private async loadRenderedHtml(sessionId: string) {
    this.loading.set(true);
    this.gymnasiumFacade.renderSession(sessionId);

    // Subscribe to the HTML result
    this.gymnasiumFacade.selectSessionHtml(sessionId).subscribe((html) => {
      if (html) {
        this.loading.set(false);
        this.renderInIframe(html);
      }
    });
  }

  private renderInIframe(html: string) {
    setTimeout(() => {
      if (this.iframeContainer?.nativeElement) {
        const container = this.iframeContainer.nativeElement;
        container.innerHTML = '';

        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.style.borderRadius = '8px';

        container.appendChild(iframe);

        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
          iframeDoc.open();
          iframeDoc.write(html);
          iframeDoc.close();
        }
      }
    }, 0);
  }

  saveChanges() {
    if (!this.session || !this.isDirty) return;

    this.saving.set(true);
    this.gymnasiumFacade.updateSession(this.session.id, {
      slug: this.editSlug,
      visibility: this.editVisibility,
    });

    // Listen for success (take 1 to avoid memory leak)
    this.gymnasiumFacade.mutations$.pipe(take(1)).subscribe(() => {
      this.saving.set(false);
      this.sessionUpdated.emit();
    });
  }

  resetChanges() {
    if (!this.session) return;
    this.editSlug = this.session.slug || '';
    this.editVisibility = this.session.visibility || 'private';
  }

  openInNewTab() {
    if (!this.editSlug) return;
    const url = `/session/${this.editSlug}`;
    window.open(url, '_blank');
  }

  downloadHtml() {
    if (!this.session) return;
    const url = `/api/gymnasium/sessions/${this.session.id}/export`;
    window.open(url, '_blank');
  }

  copyLink() {
    if (!this.editSlug) return;
    const url = `${window.location.origin}/session/${this.editSlug}`;
    navigator.clipboard.writeText(url).then(() => {
      // Could add a toast notification here
    });
  }
}
