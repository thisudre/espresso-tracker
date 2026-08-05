import { TestBed } from '@angular/core/testing';
import { BeanStore } from './bean.store';
import { StorageService } from '../storage/storage.service';
import { Bean, DEFAULT_BEAN_STATUS } from '../models/bean.model';

describe('BeanStore', () => {
  let store: BeanStore;
  let storage: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    localStorage.clear();
    storage = TestBed.inject(StorageService);
    store = TestBed.inject(BeanStore);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('items starts empty', () => {
    expect(store.items()).toEqual([]);
  });

  it('add appends bean and persists', () => {
    const bean: Bean = { id: '1', brand: 'Brazil', status: 'aberto', createdAt: '2026-08-05T00:00:00.000Z' };

    store.add(bean);

    expect(store.items()).toEqual([bean]);
    expect(storage.get<Bean[]>('beans')).toEqual([bean]);
  });

  it('add persists bean with status field', () => {
    const bean: Bean = { id: '1', brand: 'Brazil', status: 'fechado', createdAt: '2026-08-05T00:00:00.000Z' };

    store.add(bean);

    const persisted = storage.get<Bean[]>('beans');
    expect(persisted?.[0].status).toBe('fechado');
  });

  it('remove removes bean by id', () => {
    store.add({ id: '1', brand: 'Brazil', status: 'aberto', createdAt: '2026-08-05T00:00:00.000Z' });
    store.add({ id: '2', brand: 'Colombia', status: 'aberto', createdAt: '2026-08-05T01:00:00.000Z' });

    store.remove('1');

    expect(store.items().length).toBe(1);
    expect(store.items()[0].id).toBe('2');
  });

  it('update patches bean by id', () => {
    store.add({ id: '1', brand: 'Brazil', status: 'aberto', createdAt: '2026-08-05T00:00:00.000Z' });

    store.update('1', { brand: 'Brazil Special' });

    expect(store.items()[0].brand).toBe('Brazil Special');
  });

  it('update preserves id and createdAt', () => {
    store.add({ id: '1', brand: 'Brazil', status: 'aberto', createdAt: '2026-08-05T00:00:00.000Z' });

    store.update('1', { brand: 'Updated', status: 'finalizado' });

    const updated = store.items()[0];
    expect(updated.id).toBe('1');
    expect(updated.createdAt).toBe('2026-08-05T00:00:00.000Z');
    expect(updated.brand).toBe('Updated');
    expect(updated.status).toBe('finalizado');
  });

  it('byId returns correct bean', () => {
    store.add({ id: '1', brand: 'Brazil', status: 'aberto', createdAt: '2026-08-05T00:00:00.000Z' });
    store.add({ id: '2', brand: 'Colombia', status: 'fechado', createdAt: '2026-08-05T01:00:00.000Z' });

    const found = store.byId('2');

    expect(found).toBeDefined();
    expect(found?.brand).toBe('Colombia');
  });

  it('byId returns undefined for nonexistent id', () => {
    store.add({ id: '1', brand: 'Brazil', status: 'aberto', createdAt: '2026-08-05T00:00:00.000Z' });

    expect(store.byId('999')).toBeUndefined();
  });

  it('originSuggestions returns distinct non-empty values case-insensitive', () => {
    store.add({ id: '1', brand: 'A', status: 'aberto', createdAt: '', origin: 'Brazil' });
    store.add({ id: '2', brand: 'B', status: 'aberto', createdAt: '', origin: 'brazil' });
    store.add({ id: '3', brand: 'C', status: 'aberto', createdAt: '', origin: 'Colombia' });
    store.add({ id: '4', brand: 'D', status: 'aberto', createdAt: '', origin: '' });
    store.add({ id: '5', brand: 'E', status: 'aberto', createdAt: '', origin: undefined });

    expect(store.originSuggestions()).toEqual(['Brazil', 'Colombia']);
  });

  it('varietySuggestions returns distinct non-empty values case-insensitive', () => {
    store.add({ id: '1', brand: 'A', status: 'aberto', createdAt: '', variety: 'Bourbon' });
    store.add({ id: '2', brand: 'B', status: 'aberto', createdAt: '', variety: 'bourbon' });
    store.add({ id: '3', brand: 'C', status: 'aberto', createdAt: '', variety: 'Typica' });

    expect(store.varietySuggestions()).toEqual(['Bourbon', 'Typica']);
  });

  it('originSuggestions ignores whitespace-only values', () => {
    store.add({ id: '1', brand: 'A', status: 'aberto', createdAt: '', origin: '   ' });

    expect(store.originSuggestions()).toEqual([]);
  });

  it('legacy bean without status is normalized to DEFAULT_BEAN_STATUS', () => {
    const legacy: Partial<Bean>[] = [{ id: '1', brand: 'Legacy', createdAt: '2026-01-01T00:00:00.000Z' }];
    storage.set<Bean[]>('beans', legacy as Bean[]);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const freshStore = TestBed.inject(BeanStore);

    expect(freshStore.items()[0].status).toBe(DEFAULT_BEAN_STATUS);
  });

  it('storage null returns empty array', () => {
    localStorage.removeItem('beans');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const freshStore = TestBed.inject(BeanStore);

    expect(freshStore.items()).toEqual([]);
  });
});
