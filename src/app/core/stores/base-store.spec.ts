import { TestBed } from '@angular/core/testing';
import { BaseStore } from './base-store';
import { StorageService } from '../storage/storage.service';

interface TestItem {
  id: string;
  name: string;
  value: number;
}

class TestStore extends BaseStore<TestItem> {
  protected readonly storageKey = 'test-items';

  constructor(storage: StorageService) {
    super(storage);
  }

  loadPublic(): void {
    this.load();
  }
}

describe('BaseStore', () => {
  let store: TestStore;
  let storage: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    localStorage.clear();
    storage = TestBed.inject(StorageService);
    store = new TestStore(storage);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('items starts as empty array', () => {
    expect(store.items()).toEqual([]);
  });

  it('add appends to items and calls storage.set', () => {
    const spy = vi.spyOn(storage, 'set');

    store.add({ id: '1', name: 'Brazil', value: 18 });

    expect(store.items()).toEqual([{ id: '1', name: 'Brazil', value: 18 }]);
    expect(spy).toHaveBeenCalledWith('test-items', [{ id: '1', name: 'Brazil', value: 18 }]);
  });

  it('add multiple items', () => {
    store.add({ id: '1', name: 'Brazil', value: 18 });
    store.add({ id: '2', name: 'Colombia', value: 15 });

    expect(store.items()).toEqual([
      { id: '1', name: 'Brazil', value: 18 },
      { id: '2', name: 'Colombia', value: 15 },
    ]);
  });

  it('remove removes by id and calls storage.set', () => {
    store.add({ id: '1', name: 'Brazil', value: 18 });
    store.add({ id: '2', name: 'Colombia', value: 15 });
    const spy = vi.spyOn(storage, 'set');

    store.remove('1');

    expect(store.items()).toEqual([{ id: '2', name: 'Colombia', value: 15 }]);
    expect(spy).toHaveBeenCalledWith('test-items', [{ id: '2', name: 'Colombia', value: 15 }]);
  });

  it('update patches item by id and calls storage.set', () => {
    store.add({ id: '1', name: 'Brazil', value: 18 });
    const spy = vi.spyOn(storage, 'set');

    store.update('1', { value: 20 });

    expect(store.items()).toEqual([{ id: '1', name: 'Brazil', value: 20 }]);
    expect(spy).toHaveBeenCalledWith('test-items', [{ id: '1', name: 'Brazil', value: 20 }]);
  });

  it('load reads from storage and populates items', () => {
    const data = [
      { id: '1', name: 'Brazil', value: 18 },
      { id: '2', name: 'Colombia', value: 15 },
    ];
    storage.set('test-items', data);

    store.loadPublic();

    expect(store.items()).toEqual(data);
  });

  it('load treats null reading as empty array', () => {
    store.loadPublic();

    expect(store.items()).toEqual([]);
  });
});
