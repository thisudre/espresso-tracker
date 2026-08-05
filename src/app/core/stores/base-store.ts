import { signal } from '@angular/core';
import { StorageService } from '../storage/storage.service';

export abstract class BaseStore<T> {
  protected abstract readonly storageKey: string;

  readonly items = signal<T[]>([]);

  constructor(protected readonly storage: StorageService) {}

  protected load(): void {
    const data = this.storage.get<T[]>(this.storageKey);
    this.items.set(data ?? []);
  }

  protected persist(): void {
    this.storage.set(this.storageKey, this.items());
  }

  add(item: T): void {
    this.items.update((items) => [...items, item]);
    this.persist();
  }

  update(id: string, patch: Partial<T>): void {
    this.items.update((items) =>
      items.map((item) =>
        (item as Record<string, unknown>)['id'] === id
          ? { ...item, ...patch }
          : item
      )
    );
    this.persist();
  }

  remove(id: string): void {
    this.items.update((items) =>
      items.filter((item) => (item as Record<string, unknown>)['id'] !== id)
    );
    this.persist();
  }
}
