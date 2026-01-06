import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RawContent as RawContentModel } from '@kasita/common-models';
import { RawContentFacade } from '@kasita/core-state';
import { MaterialModule } from '@kasita/material';
import { Observable } from 'rxjs';
import { RawContentDetail } from './raw-content-detail/raw-content-detail';
import { RawContentList } from './raw-content-list/raw-content-list';

@Component({
  selector: 'app-raw-content',
  imports: [RawContentList, RawContentDetail, AsyncPipe, MaterialModule],
  templateUrl: './raw-content.html',
  styleUrl: './raw-content.scss',
})
export class RawContent implements OnInit {
  private rawContentFacade = inject(RawContentFacade);

  rawContent$: Observable<RawContentModel[]> = this.rawContentFacade.allRawContent$;
  selectedRawContent$: Observable<RawContentModel | null> =
    this.rawContentFacade.selectedRawContent$;
  loaded$ = this.rawContentFacade.loaded$;
  error$ = this.rawContentFacade.error$;
  mutations$ = this.rawContentFacade.mutations$;

  constructor() {
    this.mutations$.subscribe(() => this.reset());
  }

  ngOnInit(): void {
    this.reset();
  }

  reset() {
    this.loadRawContent();
    this.rawContentFacade.resetSelectedRawContent();
  }

  selectRawContent(rawContent: RawContentModel) {
    this.rawContentFacade.selectRawContent(rawContent.id as string);
  }

  loadRawContent() {
    this.rawContentFacade.loadRawContent();
  }

  saveRawContent(rawContent: RawContentModel) {
    this.rawContentFacade.saveRawContent(rawContent);
  }

  deleteRawContent(rawContent: RawContentModel) {
    this.rawContentFacade.deleteRawContent(rawContent);
  }

  cancel() {
    this.rawContentFacade.resetSelectedRawContent();
  }
}
