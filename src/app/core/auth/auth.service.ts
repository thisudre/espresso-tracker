import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  token = signal<string | null>(localStorage.getItem('auth:token'));
  isLoggedIn = computed(() => !!this.token());
  getToken(): string | null { return this.token(); }
  setToken(t: string | null) {
    if (t) { localStorage.setItem('auth:token', t); this.token.set(t); }
    else { localStorage.removeItem('auth:token'); this.token.set(null); }
  }
  getPreferences() { return this.http.get<{preferredRecipeId: string | null}>('/api/me/preferences'); }
  updatePreferences(preferredRecipeId: string | null) { return this.http.patch<{preferredRecipeId: string | null}>('/api/me/preferences', { preferredRecipeId }); }
}
