import { Component } from '@angular/core';
import { BoardGameComponent } from '@kasita/feature-board-game';

@Component({
  selector: 'app-board-game-page',
  standalone: true,
  imports: [BoardGameComponent],
  template: `<lib-board-game />`,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `],
})
export class BoardGamePage {}
