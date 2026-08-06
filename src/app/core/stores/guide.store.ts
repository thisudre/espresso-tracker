import { Injectable, signal, computed, inject } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import { ExtractionRecipe, RECIPES_BY_ID } from '../models/guide.model';

const STORAGE_KEY = 'guide:preferredRecipe';

@Injectable({ providedIn: 'root' })
export class GuideStore {
  private storage = inject(StorageService);

  selectedId = signal<string | null>(null);

  selectedRecipe = computed<ExtractionRecipe | null>(() => {
    const id = this.selectedId();
    if (!id) return null;
    return RECIPES_BY_ID[id] ?? null;
  });

  restorePreference(): void {
    const id = this.storage.get<string>(STORAGE_KEY);
    if (id && RECIPES_BY_ID[id]) {
      this.selectedId.set(id);
    } else {
      this.selectedId.set(null);
    }
  }

  select(id: string): void {
    if (!RECIPES_BY_ID[id]) return;
    this.selectedId.set(id);
    this.storage.set(STORAGE_KEY, id);
  }

  clearPreference(): void {
    this.selectedId.set(null);
    this.storage.remove(STORAGE_KEY);
  }
}
