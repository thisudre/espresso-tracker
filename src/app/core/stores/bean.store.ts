import { Injectable, inject, computed } from '@angular/core';
import { BaseStore } from './base-store';
import { Bean, DEFAULT_BEAN_STATUS } from '../models/bean.model';
import { StorageService } from '../storage/storage.service';

@Injectable({ providedIn: 'root' })
export class BeanStore extends BaseStore<Bean> {
  protected readonly storageKey = 'beans';

  readonly originSuggestions = computed(() => {
    const origins = this.items()
      .map((b) => b.origin)
      .filter((o): o is string => !!o && o.trim().length > 0)
      .map((o) => o.trim());
    const seen = new Set<string>();
    const result: string[] = [];
    for (const o of origins) {
      const lower = o.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        result.push(o);
      }
    }
    return result;
  });

  readonly varietySuggestions = computed(() => {
    const varieties = this.items()
      .map((b) => b.variety)
      .filter((v): v is string => !!v && v.trim().length > 0)
      .map((v) => v.trim());
    const seen = new Set<string>();
    const result: string[] = [];
    for (const v of varieties) {
      const lower = v.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        result.push(v);
      }
    }
    return result;
  });

  constructor() {
    super(inject(StorageService));
    this.load();
  }

  byId(id: string): Bean | undefined {
    return this.items().find((b) => b.id === id);
  }

  protected override load(): void {
    const data = this.storage.get<Bean[]>(this.storageKey);
    const items = (data ?? []).map((b) =>
      b.status ? b : { ...b, status: DEFAULT_BEAN_STATUS }
    );
    this.items.set(items);
  }
}
