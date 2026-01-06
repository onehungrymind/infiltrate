import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RawContentService } from './raw-content.service';

describe('RawContentService', () => {
  let service: RawContentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(RawContentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have correct model name', () => {
    expect(service.model).toBe('raw-content');
  });
});
