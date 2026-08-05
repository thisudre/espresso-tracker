import { TestBed } from '@angular/core/testing';
import { LogStore } from './log.store';
import { StorageService } from '../storage/storage.service';
import { BrewLog } from '../models/brew-log.model';

describe('LogStore', () => {
  let store: LogStore;
  let storage: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    localStorage.clear();
    storage = TestBed.inject(StorageService);
    store = TestBed.inject(LogStore);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('is instantiated with correct storageKey', () => {
    expect((store as any).storageKey).toBe('logs');
  });

  it('items starts empty', () => {
    expect(store.items()).toEqual([]);
  });

  it('add appends log and persists', () => {
    const log: BrewLog = { id: '1', method: 'espresso', createdAt: '2026-08-05T00:00:00.000Z' };

    store.add(log);

    expect(store.items()).toEqual([log]);
    expect(storage.get<BrewLog[]>('logs')).toEqual([log]);
  });

  it('remove removes log by id', () => {
    store.add({ id: '1', method: 'espresso', createdAt: '2026-08-05T00:00:00.000Z' });
    store.add({ id: '2', method: 'v60', createdAt: '2026-08-05T01:00:00.000Z' });

    store.remove('1');

    expect(store.items().length).toBe(1);
    expect(store.items()[0].id).toBe('2');
  });

  it('update patches log by id', () => {
    store.add({ id: '1', method: 'espresso', createdAt: '2026-08-05T00:00:00.000Z' });

    store.update('1', { method: 'v60' });

    expect(store.items()[0].method).toBe('v60');
  });
});
