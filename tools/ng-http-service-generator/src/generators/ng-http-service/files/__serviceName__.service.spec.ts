import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { <%= serviceClassName %>Service } from './<%= serviceName %>.service';

describe('<%= serviceClassName %>Service', () => {
  let service: <%= serviceClassName %>Service;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(<%= serviceClassName %>Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have correct model name', () => {
    expect(service.model).toBe('<%= serviceCamelCase %>');
  });
});
