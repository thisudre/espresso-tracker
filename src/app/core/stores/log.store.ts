import { Injectable, inject, computed } from '@angular/core';
import { BaseStore } from './base-store';
import { BrewLog, DEFAULT_LOG_METHOD } from '../models/brew-log.model';
import { BREW_METHODS } from '../models/brew.model';
import { StorageService } from '../storage/storage.service';

@Injectable({ providedIn: 'root' })
export class LogStore extends BaseStore<BrewLog> {
  protected readonly storageKey = 'logs';

  readonly grindSuggestions = computed(() => {
    const grinds = this.items()
      .map((l) => l.grind)
      .filter((g): g is string => !!g && g.trim().length > 0)
      .map((g) => g.trim());
    const seen = new Set<string>();
    const result: string[] = [];
    for (const g of grinds) {
      const lower = g.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        result.push(g);
      }
    }
    return result;
  });

  constructor() {
    super(inject(StorageService));
    this.load();
  }

  byId(id: string): BrewLog | undefined {
    return this.items().find((l) => l.id === id);
  }

  protected override load(): void {
    const data = this.storage.get<BrewLog[]>(this.storageKey);
    const items = (data ?? []).map((l) => normalizeLog(l));
    this.items.set(items);
  }
}

function normalizeLog(log: BrewLog): BrewLog {
  const method = BREW_METHODS.some((m) => m.id === log.method)
    ? log.method
    : DEFAULT_LOG_METHOD;
  return {
    ...log,
    method,
    dose: log.dose ?? null,
    water: log.water ?? null,
    totalSeconds: log.totalSeconds ?? 0,
    rating: log.rating ?? { acidity: 0, body: 0, sweetness: 0, overall: 0 },
  };
}
