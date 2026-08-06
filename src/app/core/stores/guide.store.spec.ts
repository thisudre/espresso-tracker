import { TestBed } from '@angular/core/testing';
import { GuideStore } from './guide.store';
import { StorageService } from '../storage/storage.service';

describe('GuideStore', () => {
  let store: GuideStore;
  let storageMock: {
    get: ReturnType<typeof vi.fn>;
    set: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    storageMock = {
      get: vi.fn().mockReturnValue(null),
      set: vi.fn(),
      remove: vi.fn(),
    };
    TestBed.configureTestingModule({
      providers: [
        GuideStore,
        { provide: StorageService, useValue: storageMock },
      ],
    });
    store = TestBed.inject(GuideStore);
  });

  it('selectedId starts as null', () => {
    expect(store.selectedId()).toBeNull();
  });

  it('selectedRecipe starts as null', () => {
    expect(store.selectedRecipe()).toBeNull();
  });

  it('select sets selectedId and selectedRecipe', () => {
    store.select('v60-equilibrada');

    expect(store.selectedId()).toBe('v60-equilibrada');
    expect(store.selectedRecipe()).toBeDefined();
    expect(store.selectedRecipe()?.id).toBe('v60-equilibrada');
    expect(store.selectedRecipe()?.nome).toBe('V60 Equilibrada');
  });

  it('select with invalid id is a no-op', () => {
    store.select('nonexistent-recipe');

    expect(store.selectedId()).toBeNull();
    expect(store.selectedRecipe()).toBeNull();
  });

  it('restorePreference loads valid id from storage', () => {
    storageMock.get.mockReturnValue('v60-intensa');

    store.restorePreference();

    expect(store.selectedId()).toBe('v60-intensa');
    expect(store.selectedRecipe()?.id).toBe('v60-intensa');
  });

  it('restorePreference with invalid id sets null', () => {
    storageMock.get.mockReturnValue('invalid-id');

    store.restorePreference();

    expect(store.selectedId()).toBeNull();
    expect(store.selectedRecipe()).toBeNull();
  });

  it('restorePreference with null storage sets null', () => {
    storageMock.get.mockReturnValue(null);

    store.restorePreference();

    expect(store.selectedId()).toBeNull();
    expect(store.selectedRecipe()).toBeNull();
  });

  it('clearPreference removes from storage and sets selectedId to null', () => {
    store.select('v60-suave');
    expect(store.selectedId()).toBe('v60-suave');

    store.clearPreference();

    expect(store.selectedId()).toBeNull();
    expect(store.selectedRecipe()).toBeNull();
    expect(storageMock.remove).toHaveBeenCalledWith('guide:preferredRecipe');
  });

  it('select persists to storage', () => {
    store.select('v60-intensa');

    expect(storageMock.set).toHaveBeenCalledWith('guide:preferredRecipe', 'v60-intensa');
  });
});
