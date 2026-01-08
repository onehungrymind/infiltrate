import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-challenges',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './challenges.html',
  styleUrl: './challenges.scss',
})
export class Challenges {
  constructor() {}
}
