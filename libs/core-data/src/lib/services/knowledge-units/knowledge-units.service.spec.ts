import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { KnowledgeUnitsService } from './knowledge-units.service';

describe('KnowledgeUnitsService', () => {
  let service: KnowledgeUnitsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(KnowledgeUnitsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have correct model name', () => {
    expect(service.model).toBe('knowledge-units');
  });
});
