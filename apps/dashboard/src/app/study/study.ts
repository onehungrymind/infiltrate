import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-study',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './study.html',
  styleUrl: './study.scss',
})
export class Study {}
