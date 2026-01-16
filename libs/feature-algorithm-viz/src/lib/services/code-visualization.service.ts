import { Injectable } from '@angular/core';

export interface CodeVisualizationExample {
  id: string;
  name: string;
  description: string;
  route: string;
}

@Injectable({
  providedIn: 'root',
})
export class CodeVisualizationService {
  private examples: CodeVisualizationExample[] = [
    {
      id: 'bfs',
      name: 'Breadth-First Search (BFS)',
      description: 'Schema Rankings with BFS Algorithm',
      route: 'bfs',
    },
  ];

  getExamples(): CodeVisualizationExample[] {
    return [...this.examples];
  }

  getExampleById(id: string): CodeVisualizationExample | undefined {
    return this.examples.find((ex) => ex.id === id);
  }
}
