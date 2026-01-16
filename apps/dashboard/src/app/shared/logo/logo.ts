import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './logo.html',
  styleUrl: './logo.scss',
})
export class Logo {
  @Input() collapsed = false;
}
