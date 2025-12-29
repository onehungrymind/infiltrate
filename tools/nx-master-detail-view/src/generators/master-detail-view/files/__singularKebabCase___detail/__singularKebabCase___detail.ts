import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { <%= singularClassName %> } from '@articool/api-interfaces';
import { MaterialModule } from '@articool/material';

@Component({
  selector: 'app-<%= singularKebabCase %>-detail',
  imports: [CommonModule, MaterialModule],
  templateUrl: './<%= singularKebabCase %>-detail.html',
  styleUrl: './<%= singularKebabCase %>-detail.scss',
})
export class <%= singularClassName %>Detail {
  current<%= singularClassName %>!: <%= singularClassName %>;
  originalTitle = '';
  @Input() set <%= singularPropertyName %>(value: <%= singularClassName %> | null) {
    if (value) this.originalTitle = `${value.title || value.name || 'Item'}`;
    this.current<%= singularClassName %> = Object.assign({}, value);
  }
  @Output() saved = new EventEmitter();
  @Output() cancelled = new EventEmitter();
}
