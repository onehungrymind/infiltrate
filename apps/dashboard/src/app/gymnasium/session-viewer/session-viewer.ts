import {
  Component,
  effect,
  ElementRef,
  inject,
  Input,
  signal,
  ViewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Session } from '@kasita/common-models';
import { GymnasiumFacade } from '@kasita/core-state';
import { MaterialModule } from '@kasita/material';

@Component({
  selector: 'app-session-viewer',
  imports: [MaterialModule],
  templateUrl: './session-viewer.html',
  styleUrl: './session-viewer.scss',
})
export class SessionViewer {
  private gymnasiumFacade = inject(GymnasiumFacade);
  private sanitizer = inject(DomSanitizer);

  @Input() session: Session | null = null;
  @ViewChild('iframeContainer') iframeContainer!: ElementRef<HTMLDivElement>;

  loading = signal(false);
  htmlContent = signal<SafeHtml | null>(null);

  private sessionId = signal<string | null>(null);

  constructor() {
    // Watch for session changes and load rendered HTML
    effect(() => {
      const session = this.session;
      if (session?.id && session.id !== this.sessionId()) {
        this.sessionId.set(session.id);
        this.loadRenderedHtml(session.id);
      }
    });
  }

  private async loadRenderedHtml(sessionId: string) {
    this.loading.set(true);
    this.gymnasiumFacade.renderSession(sessionId);

    // Subscribe to the HTML result
    this.gymnasiumFacade.selectSessionHtml(sessionId).subscribe((html) => {
      if (html) {
        this.loading.set(false);
        // Use an iframe to render the HTML with its own styles
        this.renderInIframe(html);
      }
    });
  }

  private renderInIframe(html: string) {
    // Wait for ViewChild to be available
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

  openInNewTab() {
    if (!this.session) return;

    // Use slug if available, otherwise fall back to id
    const identifier = this.session.slug || this.session.id;
    const endpoint = this.session.slug ? 'by-slug' : 'sessions';
    const url = this.session.slug
      ? `/api/gymnasium/sessions/by-slug/${identifier}/render`
      : `/api/gymnasium/sessions/${identifier}/render`;
    window.open(url, '_blank');
  }

  downloadHtml() {
    if (!this.session) return;

    // Trigger download
    const url = `/api/gymnasium/sessions/${this.session.id}/export`;
    window.open(url, '_blank');
  }

  copyLink() {
    if (!this.session?.slug) return;

    const url = `${window.location.origin}/api/gymnasium/sessions/by-slug/${this.session.slug}/render`;
    navigator.clipboard.writeText(url).then(() => {
      // Could add a toast notification here
    });
  }
}
