import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Principle } from '@kasita/common-models';
import { PrincipleFacade } from '@kasita/core-state';
import { MaterialModule } from '@kasita/material';
import { Observable } from 'rxjs';
import { PrincipleDetail } from './principle-detail/principle-detail';
import { PrinciplesList } from './principles-list/principles-list';

@Component({
  selector: 'app-principles',
  imports: [PrinciplesList, PrincipleDetail, AsyncPipe, MaterialModule],
  templateUrl: './principles.html',
  styleUrl: './principles.scss',
})
export class Principles implements OnInit {
  private principleFacade = inject(PrincipleFacade);

  principles$: Observable<Principle[]> =
    this.principleFacade.allPrinciples$;
  selectedPrinciple$: Observable<Principle | null> =
    this.principleFacade.selectedPrinciple$;
  loaded$ = this.principleFacade.loaded$;
  error$ = this.principleFacade.error$;
  mutations$ = this.principleFacade.mutations$;

  constructor() {
    this.mutations$.subscribe(() => this.reset());
  }

  ngOnInit(): void {
    this.reset();
  }

  reset() {
    this.loadPrinciples();
    this.principleFacade.resetSelectedPrinciple();
  }

  selectPrinciple(principle: Principle) {
    this.principleFacade.selectPrinciple(principle.id as string);
  }

  loadPrinciples() {
    this.principleFacade.loadPrinciples();
  }

  savePrinciple(principle: Principle) {
    this.principleFacade.savePrinciple(principle);
  }

  deletePrinciple(principle: Principle) {
    this.principleFacade.deletePrinciple(principle);
  }

  cancel() {
    this.principleFacade.resetSelectedPrinciple();
  }
}
