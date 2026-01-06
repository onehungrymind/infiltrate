import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UserProgressService } from './user-progress.service';

describe('UserProgressService', () => {
  let service: UserProgressService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(UserProgressService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have correct model name', () => {
    expect(service.model).toBe('user-progress');
  });
});
