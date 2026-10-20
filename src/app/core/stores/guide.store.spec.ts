import { TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { GuideStore } from './guide.store';
import { StorageService } from '../storage/storage.service';
import { GuideApiService } from '../api/guide-api.service';
import { AuthService } from '../auth/auth.service';
import { TEST_RECIPES } from '../testing/guide-fixtures';
import { ExtractionRecipe } from '../models/guide.model';

describe('GuideStore', () => {
  let store: GuideStore;
  let storageMock: {
    get: ReturnType<typeof vi.fn>;
    set: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };
  let apiMock: {
    list: ReturnType<typeof vi.fn>;
    getById: ReturnType<typeof vi.fn>;
  };
  let authMock: {
    isLoggedIn: ReturnType<typeof vi.fn>;
    getPreferences: ReturnType<typeof vi.fn>;
    updatePreferences: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    storageMock = {
      get: vi.fn().mockReturnValue(null),
      set: vi.fn(),
      remove: vi.fn(),
    };
    apiMock = {
      list: vi.fn(() => of(TEST_RECIPES)),
      getById: vi.fn((id: string) => of(TEST_RECIPES.find(r => r.id === id) ?? null)),
    };
    authMock = {
      isLoggedIn: vi.fn(() => false),
      getPreferences: vi.fn(() => of({ preferredRecipeId: null })),
      updatePreferences: vi.fn(() => of({ preferredRecipeId: null })),
    };
    TestBed.configureTestingModule({
      providers: [
        GuideStore,
        { provide: StorageService, useValue: storageMock },
        { provide: GuideApiService, useValue: apiMock },
        { provide: AuthService, useValue: authMock },
      ],
    });
    store = TestBed.inject(GuideStore);
    // Receitas vêm da API agora — o store inicia vazio (FE-01).
    store.recipes.set(TEST_RECIPES);
  });

  it('selectedId starts as null', () => {
    expect(store.selectedId()).toBeNull();
  });

  it('selectedRecipe starts as null', () => {
    expect(store.selectedRecipe()).toBeNull();
  });

  it('load populates recipes from the API and restores preference', () => {
    storageMock.get.mockReturnValue('v60-intensa');

    store.load();

    expect(apiMock.list).toHaveBeenCalled();
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
    expect(store.recipes().length).toBe(TEST_RECIPES.length);
    expect(store.selectedId()).toBe('v60-intensa');
  });

  it('load with API error sets error and clears loading', () => {
    apiMock.list.mockReturnValue({
      subscribe: ({ error }: { error: (e: unknown) => void }) => error(new Error('offline')),
    });

    store.load();

    expect(store.loading()).toBe(false);
    expect(store.error()).toBe('offline');
    expect(store.recipes().length).toBe(TEST_RECIPES.length);
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

  it('restorePreference when logged in uses API preferences', () => {
    authMock.isLoggedIn.mockReturnValue(true);
    authMock.getPreferences.mockReturnValue(of({ preferredRecipeId: 'v60-suave' }));

    store.restorePreference();

    expect(authMock.getPreferences).toHaveBeenCalled();
    expect(store.selectedId()).toBe('v60-suave');
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

  it('select when logged in also persists preference via API', () => {
    authMock.isLoggedIn.mockReturnValue(true);

    store.select('v60-intensa');

    expect(authMock.updatePreferences).toHaveBeenCalledWith('v60-intensa');
  });

  it('slow vira true após 3s de load pendente e volta a false quando a API responde', () => {
    vi.useFakeTimers();
    try {
      const pending = new Subject<ExtractionRecipe[]>();
      apiMock.list.mockReturnValue(pending.asObservable());

      store.load();
      expect(store.slow()).toBe(false);

      vi.advanceTimersByTime(3000);
      expect(store.slow()).toBe(true);

      pending.next(TEST_RECIPES);
      pending.complete();
      expect(store.slow()).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it('slow volta a false quando a API falha', () => {
    vi.useFakeTimers();
    try {
      const pending = new Subject<ExtractionRecipe[]>();
      apiMock.list.mockReturnValue(pending.asObservable());

      store.load();
      vi.advanceTimersByTime(3000);
      expect(store.slow()).toBe(true);

      pending.error(new Error('offline'));
      expect(store.slow()).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });
});
