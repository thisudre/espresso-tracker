import { TestBed } from '@angular/core/testing';
import { BeanStore } from './bean.store';
import { StorageService } from '../storage/storage.service';
import { Bean } from '../models/bean.model';

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
    const bean: Bean = { id: '1', brand: 'Brazil', createdAt: '2026-08-05T00:00:00.000Z' };

    store.add(bean);

    expect(store.items()).toEqual([bean]);
    expect(storage.get<Bean[]>('beans')).toEqual([bean]);
  });

  it('remove removes bean by id', () => {
    store.add({ id: '1', brand: 'Brazil', createdAt: '2026-08-05T00:00:00.000Z' });
    store.add({ id: '2', brand: 'Colombia', createdAt: '2026-08-05T01:00:00.000Z' });

    store.remove('1');

    expect(store.items().length).toBe(1);
    expect(store.items()[0].id).toBe('2');
  });

  it('update patches bean by id', () => {
    store.add({ id: '1', brand: 'Brazil', createdAt: '2026-08-05T00:00:00.000Z' });

    store.update('1', { brand: 'Brazil Special' });

    expect(store.items()[0].brand).toBe('Brazil Special');
  });
});
