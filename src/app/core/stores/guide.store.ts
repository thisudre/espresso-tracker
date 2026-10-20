import { Injectable, signal, computed, inject } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import { ExtractionRecipe } from '../models/guide.model';
import { GuideApiService } from '../api/guide-api.service';
import { AuthService } from '../auth/auth.service';
const STORAGE_KEY = 'guide:preferredRecipe';
@Injectable({ providedIn: 'root' })
export class GuideStore {
  private storage = inject(StorageService);
  private api = inject(GuideApiService);
  private auth = inject(AuthService);
  recipes = signal<ExtractionRecipe[]>([]);
  loading = signal(false);
  slow = signal(false);
  error = signal<string | null>(null);
  selectedId = signal<string | null>(null);
  private slowTimer: ReturnType<typeof setTimeout> | null = null;
  recipesById = computed(() => Object.fromEntries(this.recipes().map(r => [r.id, r])) as Record<string, ExtractionRecipe>);
  selectedRecipe = computed<ExtractionRecipe | null>(() => { const id=this.selectedId(); return id ? (this.recipesById()[id] ?? null) : null; });
  load(): void {
    this.loading.set(true); this.error.set(null);
    this.startSlowTimer();
    this.api.list().subscribe({ next: v => { this.clearSlowTimer(); this.recipes.set(v); this.loading.set(false); this.restorePreference(); }, error: e => { this.clearSlowTimer(); this.loading.set(false); this.error.set(e?.message ?? 'Erro ao carregar guias'); } });
  }
  private startSlowTimer(): void {
    this.clearSlowTimer();
    this.slowTimer = setTimeout(() => this.slow.set(true), 3000);
  }
  private clearSlowTimer(): void {
    if (this.slowTimer !== null) { clearTimeout(this.slowTimer); this.slowTimer = null; }
    this.slow.set(false);
  }
  restorePreference(): void {
    if (this.auth.isLoggedIn()) {
      this.auth.getPreferences().subscribe({ next: v => this.selectedId.set(v.preferredRecipeId ?? this.storage.get<string>(STORAGE_KEY) ?? null), error: () => this.fallbackRestore() });
    } else this.fallbackRestore();
  }
  private fallbackRestore(): void {
    const id = this.storage.get<string>(STORAGE_KEY);
    this.selectedId.set(id && this.recipesById()[id] ? id : null);
  }
  select(id: string): void {
    if (!this.recipesById()[id]) return;
    this.selectedId.set(id); this.storage.set(STORAGE_KEY, id);
    if (this.auth.isLoggedIn()) this.auth.updatePreferences(id).subscribe({});
  }
  clearPreference(): void { this.selectedId.set(null); this.storage.remove(STORAGE_KEY); if (this.auth.isLoggedIn()) this.auth.updatePreferences(null).subscribe({}); }
}
