import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotebookViewerComponent } from './notebook-viewer/notebook-viewer';

@Component({
  selector: 'app-notebook',
  standalone: true,
  imports: [CommonModule, NotebookViewerComponent],
  templateUrl: './notebook.html',
  styleUrl: './notebook.scss',
})
export class NotebookComponent {
}
