import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal, WritableSignal } from '@angular/core';
import { MaterialModule } from '@kasita/material';

import { DotSpinner } from '../dot-spinner/dot-spinner';

@Component({
  selector: 'app-pipeline-column',
  standalone: true,
  imports: [CommonModule, MaterialModule, DotSpinner],
  templateUrl: './pipeline-column.html',
  styleUrl: './pipeline-column.scss',
})
export class PipelineColumn {
  @Input() title = '';
  @Input() actionLabel = '';
  @Input() actionIcon = 'play_arrow';
  @Input() items: WritableSignal<any[]> = signal([]);
  @Input() loading: WritableSignal<boolean> = signal(false);
  @Input() enabled: WritableSignal<boolean> = signal(true);
  @Input() showAction = true;
  @Input() emptyMessage = 'No items';
  @Input() emptyIcon = 'inbox';

  // Secondary action (add/create button)
  @Input() showSecondaryAction = false;
  @Input() secondaryActionIcon = 'add';

  @Output() action = new EventEmitter<void>();
  @Output() secondaryAction = new EventEmitter<void>();

  get itemCount(): number {
    return this.items().length;
  }

  get isLoading(): boolean {
    return this.loading();
  }

  get isEnabled(): boolean {
    return this.enabled();
  }

  onAction() {
    if (!this.isLoading && this.isEnabled) {
      this.action.emit();
    }
  }

  onSecondaryAction() {
    this.secondaryAction.emit();
  }
}
