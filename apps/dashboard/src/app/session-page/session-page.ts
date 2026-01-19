import {
  Component,
  DestroyRef,
  ElementRef,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { GymnasiumFacade } from '@kasita/core-state';
import { MaterialModule } from '@kasita/material';
import { filter, map, switchMap } from 'rxjs';

@Component({
  selector: 'app-session-page',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './session-page.html',
  styleUrl: './session-page.scss',
})
export class SessionPage implements OnInit {
  private route = inject(ActivatedRoute);
  private gymnasiumFacade = inject(GymnasiumFacade);
  private destroyRef = inject(DestroyRef);

  @ViewChild('iframeContainer') iframeContainer!: ElementRef<HTMLDivElement>;

  slug = toSignal(this.route.paramMap.pipe(map((params) => params.get('slug'))));
  session = toSignal(this.gymnasiumFacade.selectedSession$);
  loading = toSignal(this.gymnasiumFacade.loading$);
  error = toSignal(this.gymnasiumFacade.error$);

  htmlLoaded = signal(false);

  ngOnInit() {
    // Subscribe to slug changes and load session + render HTML
    this.route.paramMap
      .pipe(
        map((params) => params.get('slug')),
        filter((slug): slug is string => !!slug),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((slug) => {
        this.htmlLoaded.set(false);
        this.gymnasiumFacade.loadSessionBySlug(slug);
        this.gymnasiumFacade.renderSessionBySlug(slug);
      });

    // Subscribe to rendered HTML changes
    this.route.paramMap
      .pipe(
        map((params) => params.get('slug')),
        filter((slug): slug is string => !!slug),
        switchMap((slug) => this.gymnasiumFacade.selectSessionHtmlBySlug(slug)),
        filter((html): html is string => !!html),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((html) => {
        if (!this.htmlLoaded()) {
          this.htmlLoaded.set(true);
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
}
