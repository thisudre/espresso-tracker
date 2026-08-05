import { Injectable } from '@angular/core';

export const SCHEMA_VERSION = 1;

export interface StoredEnvelope<T> {
  version: number;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class StorageService {
  private warned = false;

  get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) {
        return null;
      }

      const envelope: StoredEnvelope<T> = JSON.parse(raw);

      if (!envelope || typeof envelope !== 'object' || envelope.version !== SCHEMA_VERSION) {
        return null;
      }

      return envelope.data;
    } catch {
      this.warnOnce('get', key);
      return null;
    }
  }

  set<T>(key: string, value: T): void {
    try {
      const envelope: StoredEnvelope<T> = { version: SCHEMA_VERSION, data: value };
      localStorage.setItem(key, JSON.stringify(envelope));
    } catch {
      this.warnOnce('set', key);
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      this.warnOnce('remove', key);
    }
  }

  private warnOnce(operation: string, key: string): void {
    if (!this.warned) {
      console.warn(`StorageService: ${operation} failed for key "${key}" — localStorage may be unavailable`);
      this.warned = true;
    }
  }
}
