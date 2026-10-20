import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;
  const originalBase = environment.apiBase;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
    environment.apiBase = '/custom-api';
  });

  afterEach(() => {
    environment.apiBase = originalBase;
  });

  it('getPreferences() busca em <apiBase>/me/preferences', () => {
    service.getPreferences().subscribe();
    const req = http.expectOne('/custom-api/me/preferences');
    expect(req.request.method).toBe('GET');
    req.flush({ preferredRecipeId: null });
  });

  it('updatePreferences() faz PATCH em <apiBase>/me/preferences', () => {
    service.updatePreferences('v60-intensa').subscribe();
    const req = http.expectOne('/custom-api/me/preferences');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ preferredRecipeId: 'v60-intensa' });
    req.flush({ preferredRecipeId: 'v60-intensa' });
  });
});
