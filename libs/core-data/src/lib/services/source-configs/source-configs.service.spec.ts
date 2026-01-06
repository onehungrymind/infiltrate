import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SourceConfigsService } from './source-configs.service';

describe('SourceConfigsService', () => {
  let service: SourceConfigsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(SourceConfigsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have correct model name', () => {
    expect(service.model).toBe('source-configs');
  });
});
