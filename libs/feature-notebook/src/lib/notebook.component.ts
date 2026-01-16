import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { NotebookViewerComponent } from './notebook-viewer/notebook-viewer.component';

@Component({
  selector: 'lib-notebook',
  standalone: true,
  imports: [CommonModule, NotebookViewerComponent],
  templateUrl: './notebook.component.html',
  styleUrl: './notebook.component.scss',
})
export class NotebookComponent {
}
