import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { KnowledgeUnit } from '@kasita/common-models';
import { MaterialModule } from '@kasita/material';

@Component({
  selector: 'app-knowledge-unit-detail',
  imports: [CommonModule, MaterialModule],
  templateUrl: './knowledge-unit-detail.html',
  styleUrl: './knowledge-unit-detail.scss',
})
export class KnowledgeUnitDetail {
  currentKnowledgeUnit!: KnowledgeUnit;
  originalTitle = '';
  @Input() set knowledgeUnit(value: KnowledgeUnit | null) {
    if (value) this.originalTitle = `${value.title || value.name || 'Item'}`;
    this.currentKnowledgeUnit = Object.assign({}, value);
  }
  @Output() saved = new EventEmitter();
  @Output() cancelled = new EventEmitter();
}
