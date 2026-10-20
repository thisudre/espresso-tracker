import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { GuideApiService } from './guide-api.service';
import { environment } from '../../../environments/environment';

describe('GuideApiService', () => {
  let service: GuideApiService;
  let http: HttpTestingController;
  const originalBase = environment.apiBase;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(GuideApiService);
    http = TestBed.inject(HttpTestingController);
    environment.apiBase = '/custom-api';
  });

  afterEach(() => {
    environment.apiBase = originalBase;
  });

  it('list() busca em <apiBase>/guides', () => {
    service.list().subscribe();
    const req = http.expectOne('/custom-api/guides');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('getById() busca em <apiBase>/guides/:id', () => {
    service.getById('v60-equilibrada').subscribe();
    const req = http.expectOne('/custom-api/guides/v60-equilibrada');
    expect(req.request.method).toBe('GET');
    req.flush({});
  });
});
