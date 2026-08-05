import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    localStorage.clear();
    service = TestBed.inject(StorageService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should roundtrip set then get', () => {
    const key = 'test-key';
    const value = { name: 'Brazilian', weight: 18 };

    service.set(key, value);

    expect(service.get<typeof value>(key)).toEqual(value);
  });

  it('should return null for absent key', () => {
    expect(service.get('nonexistent')).toBeNull();
  });

  it('should return null for incompatible version', () => {
    const key = 'version-key';
    const raw = JSON.stringify({ version: 999, data: { test: true } });
    localStorage.setItem(key, raw);

    expect(service.get(key)).toBeNull();
  });

  it('should return null for corrupted JSON', () => {
    const key = 'corrupt-key';
    localStorage.setItem(key, '{invalid json');

    expect(service.get(key)).toBeNull();
  });

  it('should delete the key on remove', () => {
    const key = 'remove-key';
    service.set(key, 'hello');

    service.remove(key);

    expect(service.get(key)).toBeNull();
  });

  describe('when localStorage is unavailable', () => {
    let originalGetItem: typeof localStorage.getItem;
    let originalSetItem: typeof localStorage.setItem;
    let originalRemoveItem: typeof localStorage.removeItem;

    beforeEach(() => {
      originalGetItem = Storage.prototype.getItem;
      originalSetItem = Storage.prototype.setItem;
      originalRemoveItem = Storage.prototype.removeItem;

      const throwFn = () => {
        throw new Error('Storage unavailable');
      };

      Storage.prototype.getItem = throwFn as typeof Storage.prototype.getItem;
      Storage.prototype.setItem = throwFn as typeof Storage.prototype.setItem;
      Storage.prototype.removeItem = throwFn as typeof Storage.prototype.removeItem;
    });

    afterEach(() => {
      Storage.prototype.getItem = originalGetItem;
      Storage.prototype.setItem = originalSetItem;
      Storage.prototype.removeItem = originalRemoveItem;
    });

    it('get should return null without throwing', () => {
      expect(() => service.get('any-key')).not.toThrow();
      expect(service.get('any-key')).toBeNull();
    });

    it('set should be a no-op without throwing', () => {
      expect(() => service.set('any-key', 'value')).not.toThrow();
    });

    it('remove should be a no-op without throwing', () => {
      expect(() => service.remove('any-key')).not.toThrow();
    });
  });
});
