import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ExtractionRecipe } from '../models/guide.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class GuideApiService {
  private http = inject(HttpClient);

  list() { return this.http.get<ExtractionRecipe[]>(`${environment.apiBase}/guides`); }
  getById(id: string) { return this.http.get<ExtractionRecipe>(`${environment.apiBase}/guides/${id}`); }
}
