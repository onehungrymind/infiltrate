import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LearningPathsService } from './learning-paths.service';

describe('LearningPathsService', () => {
  let service: LearningPathsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(LearningPathsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have correct model name', () => {
    expect(service.model).toBe('learning-paths');
  });
});
