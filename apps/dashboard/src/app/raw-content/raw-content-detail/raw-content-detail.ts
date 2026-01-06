import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RawContent } from '@kasita/common-models';
import { MaterialModule } from '@kasita/material';

@Component({
  selector: 'app-raw-content-detail',
  imports: [CommonModule, MaterialModule],
  templateUrl: './raw-content-detail.html',
  styleUrl: './raw-content-detail.scss',
})
export class RawContentDetail {
  currentRawContent!: RawContent;
  originalTitle = '';
  @Input() set rawContent(value: RawContent | null) {
    if (value) this.originalTitle = `${value.title || value.name || 'Item'}`;
    this.currentRawContent = Object.assign({}, value);
  }
  @Output() saved = new EventEmitter();
  @Output() cancelled = new EventEmitter();
}
