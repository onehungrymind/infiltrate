import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeatureBoardGame } from './feature-board-game';

describe('FeatureBoardGame', () => {
  let component: FeatureBoardGame;
  let fixture: ComponentFixture<FeatureBoardGame>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatureBoardGame],
    }).compileComponents();

    fixture = TestBed.createComponent(FeatureBoardGame);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
