import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SourceConfig } from '@kasita/common-models';
import { MaterialModule } from '@kasita/material';

@Component({
  selector: 'app-source-config-detail',
  imports: [CommonModule, MaterialModule],
  templateUrl: './source-config-detail.html',
  styleUrl: './source-config-detail.scss',
})
export class SourceConfigDetail {
  currentSourceConfig!: SourceConfig;
  originalTitle = '';
  @Input() set sourceConfig(value: SourceConfig | null) {
    if (value) this.originalTitle = `${value.title || value.name || 'Item'}`;
    this.currentSourceConfig = Object.assign({}, value);
  }
  @Output() saved = new EventEmitter();
  @Output() cancelled = new EventEmitter();
}
