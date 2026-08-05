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

  it('items starts empty', () => {
    expect(store.items()).toEqual([]);
  });

  it('add appends log and persists', () => {
    const log: BrewLog = {
      id: '1',
      method: 'espresso',
      dose: 18,
      water: 36,
      totalSeconds: 30,
      rating: { acidity: 0, body: 0, sweetness: 0, overall: 0 },
      createdAt: '2026-08-05T00:00:00.000Z',
    };

    store.add(log);

    expect(store.items()).toEqual([log]);
    expect(storage.get<BrewLog[]>('logs')).toEqual([log]);
  });

  it('remove removes log by id', () => {
    store.add({ id: '1', method: 'espresso', dose: null, water: null, totalSeconds: 0, rating: { acidity: 0, body: 0, sweetness: 0, overall: 0 }, createdAt: '2026-08-05T00:00:00.000Z' });
    store.add({ id: '2', method: 'v60', dose: null, water: null, totalSeconds: 0, rating: { acidity: 0, body: 0, sweetness: 0, overall: 0 }, createdAt: '2026-08-05T01:00:00.000Z' });

    store.remove('1');

    expect(store.items().length).toBe(1);
    expect(store.items()[0].id).toBe('2');
  });

  it('update patches log by id', () => {
    store.add({ id: '1', method: 'espresso', dose: null, water: null, totalSeconds: 0, rating: { acidity: 0, body: 0, sweetness: 0, overall: 0 }, createdAt: '2026-08-05T00:00:00.000Z' });

    store.update('1', { method: 'v60' });

    expect(store.items()[0].method).toBe('v60');
  });

  it('update preserves id and createdAt', () => {
    store.add({ id: '1', method: 'espresso', dose: null, water: null, totalSeconds: 0, rating: { acidity: 0, body: 0, sweetness: 0, overall: 0 }, createdAt: '2026-08-05T00:00:00.000Z' });

    store.update('1', { method: 'v60', dose: 18 });

    const updated = store.items()[0];
    expect(updated.id).toBe('1');
    expect(updated.createdAt).toBe('2026-08-05T00:00:00.000Z');
    expect(updated.method).toBe('v60');
    expect(updated.dose).toBe(18);
  });

  it('byId returns correct log', () => {
    store.add({ id: '1', method: 'espresso', dose: null, water: null, totalSeconds: 0, rating: { acidity: 0, body: 0, sweetness: 0, overall: 0 }, createdAt: '' });
    store.add({ id: '2', method: 'v60', dose: null, water: null, totalSeconds: 0, rating: { acidity: 0, body: 0, sweetness: 0, overall: 0 }, createdAt: '' });

    const found = store.byId('2');

    expect(found).toBeDefined();
    expect(found?.method).toBe('v60');
  });

  it('byId returns undefined for nonexistent id', () => {
    store.add({ id: '1', method: 'espresso', dose: null, water: null, totalSeconds: 0, rating: { acidity: 0, body: 0, sweetness: 0, overall: 0 }, createdAt: '' });

    expect(store.byId('999')).toBeUndefined();
  });

  it('grindSuggestions returns distinct non-empty values case-insensitive', () => {
    store.add({ id: '1', method: 'espresso', dose: null, water: null, totalSeconds: 0, rating: { acidity: 0, body: 0, sweetness: 0, overall: 0 }, createdAt: '', grind: 'Media' });
    store.add({ id: '2', method: 'v60', dose: null, water: null, totalSeconds: 0, rating: { acidity: 0, body: 0, sweetness: 0, overall: 0 }, createdAt: '', grind: 'media' });
    store.add({ id: '3', method: 'espresso', dose: null, water: null, totalSeconds: 0, rating: { acidity: 0, body: 0, sweetness: 0, overall: 0 }, createdAt: '', grind: 'Fina' });
    store.add({ id: '4', method: 'v60', dose: null, water: null, totalSeconds: 0, rating: { acidity: 0, body: 0, sweetness: 0, overall: 0 }, createdAt: '', grind: '' });
    store.add({ id: '5', method: 'espresso', dose: null, water: null, totalSeconds: 0, rating: { acidity: 0, body: 0, sweetness: 0, overall: 0 }, createdAt: '', grind: undefined });

    expect(store.grindSuggestions()).toEqual(['Media', 'Fina']);
  });

  it('grindSuggestions ignores whitespace-only values', () => {
    store.add({ id: '1', method: 'espresso', dose: null, water: null, totalSeconds: 0, rating: { acidity: 0, body: 0, sweetness: 0, overall: 0 }, createdAt: '', grind: '   ' });

    expect(store.grindSuggestions()).toEqual([]);
  });

  it('legacy log without new fields is normalized', () => {
    const legacy = [{ id: '1', method: 'espresso', createdAt: '2026-01-01T00:00:00.000Z' }];
    storage.set<BrewLog[]>('logs', legacy as BrewLog[]);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const freshStore = TestBed.inject(LogStore);

    const log = freshStore.items()[0];
    expect(log.dose).toBeNull();
    expect(log.water).toBeNull();
    expect(log.totalSeconds).toBe(0);
    expect(log.rating).toEqual({ acidity: 0, body: 0, sweetness: 0, overall: 0 });
  });

  it('legacy log with invalid method is normalized to espresso', () => {
    const legacy = [{ id: '1', method: 'invalid', createdAt: '2026-01-01T00:00:00.000Z' }];
    storage.set<BrewLog[]>('logs', legacy as BrewLog[]);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const freshStore = TestBed.inject(LogStore);

    expect(freshStore.items()[0].method).toBe('espresso');
  });

  it('storage null returns empty array', () => {
    localStorage.removeItem('logs');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const freshStore = TestBed.inject(LogStore);

    expect(freshStore.items()).toEqual([]);
  });
});
