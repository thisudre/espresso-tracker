import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ExtractionStore } from './extraction.store';
import { GuideStore } from './guide.store';
import { currentPhase } from '../utils/timer.util';
import { StorageService } from '../storage/storage.service';
import { GuideApiService } from '../api/guide-api.service';
import { AuthService } from '../auth/auth.service';
import { TEST_RECIPES } from '../testing/guide-fixtures';

describe('ExtractionStore', () => {
  let store: ExtractionStore;

  const storageMock: { get: ReturnType<typeof vi.fn>; set: ReturnType<typeof vi.fn>; remove: ReturnType<typeof vi.fn> } = {
    get: vi.fn().mockReturnValue(null),
    set: vi.fn(),
    remove: vi.fn(),
  };
  const apiMock = { list: vi.fn(() => of(TEST_RECIPES)), getById: vi.fn(() => of(null)) };
  const authMock = {
    isLoggedIn: vi.fn(() => false),
    getPreferences: vi.fn(() => of({ preferredRecipeId: null })),
    updatePreferences: vi.fn(() => of({ preferredRecipeId: null })),
  };

  beforeEach(() => {
    storageMock.get.mockReturnValue(null);
    storageMock.set.mockClear();
    storageMock.remove.mockClear();
    authMock.isLoggedIn.mockReturnValue(false);
    TestBed.configureTestingModule({
      providers: [
        { provide: StorageService, useValue: storageMock },
        { provide: GuideApiService, useValue: apiMock },
        { provide: AuthService, useValue: authMock },
      ],
    });
    vi.useFakeTimers();
    store = TestBed.inject(ExtractionStore);
    // Receitas vêm da API — o GuideStore inicia vazio (FE-01).
    TestBed.inject(GuideStore).recipes.set(TEST_RECIPES);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.useRealTimers();
  });

  it('default state: method espresso, ratio 2, dose empty, water null, timer idle', () => {
    expect(store.method()).toBe('espresso');
    expect(store.ratioInput()).toBe('2');
    expect(store.doseInput()).toBe('');
    expect(store.water()).toBeNull();
    expect(store.timer().status).toBe('idle');
    expect(store.timer().mode).toBe('simple');
    expect(currentPhase(store.timer()).id).toBe('preinfusion');
    expect(store.timer().phaseSeconds).toBe(0);
    expect(store.timer().totalSeconds).toBe(0);
    expect(store.timer().completed).toBe(false);
    expect(store.timer().phases.length).toBe(2);
  });

  it('selectMethod v60 sets ratio to 16, dose preserved, water recalculates', () => {
    store.setDose('15');
    store.selectMethod('v60');

    expect(store.method()).toBe('v60');
    expect(store.ratioInput()).toBe('16');
    expect(store.doseInput()).toBe('15');
    expect(store.water()).toBe(240);
  });

  it('selectMethod preserves dose when dose is set', () => {
    store.setDose('20');
    store.selectMethod('prensa');

    expect(store.doseInput()).toBe('20');
    expect(store.method()).toBe('prensa');
  });

  it('setDose 15 with v60 gives water 240', () => {
    store.selectMethod('v60');
    store.setDose('15');

    expect(store.water()).toBe(240);
  });

  it('setRatio recalculates water', () => {
    store.setDose('15');
    store.setRatio('17');

    expect(store.ratio()).toBe(17);
    expect(store.water()).toBe(255);
  });

  it('invalid dose returns water null without throwing', () => {
    store.setDose('abc');
    store.setRatio('16');

    expect(store.water()).toBeNull();
  });

  it('start sets timer status to running', () => {
    store.start();

    expect(store.timer().status).toBe('running');
  });

  it('pause sets timer status to paused', () => {
    store.start();
    store.pause();

    expect(store.timer().status).toBe('paused');
  });

  it('reset returns timer to idle with preinfusion phase and zero times', () => {
    store.start();
    vi.advanceTimersByTime(3000);
    TestBed.flushEffects();

    store.reset();

    expect(store.timer().status).toBe('idle');
    expect(currentPhase(store.timer()).id).toBe('preinfusion');
    expect(store.timer().phaseSeconds).toBe(0);
    expect(store.timer().totalSeconds).toBe(0);
  });

  it('advancePhase moves from preinfusion to extraction with phaseSeconds 0', () => {
    store.start();
    vi.advanceTimersByTime(5000);
    TestBed.flushEffects();

    store.advancePhase();

    expect(currentPhase(store.timer()).id).toBe('extraction');
    expect(store.timer().phaseSeconds).toBe(0);
    expect(store.timer().totalSeconds).toBe(5);
  });

  it('routeExited resets the timer', () => {
    store.start();
    vi.advanceTimersByTime(3000);
    TestBed.flushEffects();

    store.routeExited();

    expect(store.timer().status).toBe('idle');
    expect(store.timer().totalSeconds).toBe(0);
  });

  it('brewState reflects method, dose, ratio, and timer state', () => {
    store.selectMethod('v60');
    store.setDose('15');
    store.start();
    vi.advanceTimersByTime(10000);
    TestBed.flushEffects();

    const state = store.brewState();
    expect(state.method).toBe('v60');
    expect(state.methodLabel).toBe('Coado/V60');
    expect(state.dose).toBe(15);
    expect(state.ratio).toBe(16);
    expect(state.water).toBe(240);
    expect(state.phase).toBe('preinfusion');
    expect(state.phaseLabel).toBe('Pré-infusão');
    expect(state.phaseTime).toBe(10);
    expect(state.totalTime).toBe(10);
    expect(state.running).toBe(true);
  });

  it('brewState with no brew active shows preinfusion, time 0, running false', () => {
    const state = store.brewState();

    expect(state.phase).toBe('preinfusion');
    expect(state.phaseTime).toBe(0);
    expect(state.totalTime).toBe(0);
    expect(state.running).toBe(false);
  });

  it('timer ticks while running and pauses correctly', () => {
    store.start();
    TestBed.flushEffects();

    vi.advanceTimersByTime(3000);
    TestBed.flushEffects();

    expect(store.timer().totalSeconds).toBe(3);
    expect(store.timer().phaseSeconds).toBe(3);

    store.pause();
    TestBed.flushEffects();
    vi.advanceTimersByTime(5000);
    TestBed.flushEffects();

    expect(store.timer().totalSeconds).toBe(3);
  });

  // === Recipe mode orchestration tests ===

  it('routeEntered restores compatible preference (v60 → recipe mode)', () => {
    storageMock.get.mockReturnValue('v60-suave');
    store.selectMethod('v60');
    store.routeEntered();
    TestBed.flushEffects();

    expect(store.timer().mode).toBe('recipe');
    expect(currentPhase(store.timer()).id).toBe('v60-suave-1');
    expect(store.timer().totalSeconds).toBe(0);
    expect(store.timer().completed).toBe(false);
  });

  it('routeEntered does NOT restore incompatible preference (method ≠ v60)', () => {
    storageMock.get.mockReturnValue('v60-suave');
    store.routeEntered();
    TestBed.flushEffects();

    expect(store.timer().mode).toBe('simple');
  });

  it('routeEntered does NOT restore invalid id', () => {
    storageMock.get.mockReturnValue('nonexistent');
    store.selectMethod('v60');
    store.routeEntered();
    TestBed.flushEffects();

    expect(store.timer().mode).toBe('simple');
  });

  it('selectRecipe configures recipe + resets timer + persists', () => {
    store.selectMethod('v60');
    store.selectRecipe('v60-suave');

    expect(store.timer().mode).toBe('recipe');
    expect(store.timer().phases.length).toBe(4);
    expect(currentPhase(store.timer()).id).toBe('v60-suave-1');
    expect(store.timer().totalSeconds).toBe(0);
    expect(storageMock.set).toHaveBeenCalledWith('guide:preferredRecipe', 'v60-suave');
  });

  it('exitRecipe goes back to simple + clears preference', () => {
    store.selectMethod('v60');
    store.selectRecipe('v60-suave');
    store.exitRecipe();

    expect(store.timer().mode).toBe('simple');
    expect(store.timer().phases.length).toBe(2);
    expect(storageMock.remove).toHaveBeenCalledWith('guide:preferredRecipe');
  });

  it("selectMethod('espresso') with recipe active → simple + preference preserved", () => {
    store.selectMethod('v60');
    store.selectRecipe('v60-suave');
    store.selectMethod('espresso');

    expect(store.timer().mode).toBe('simple');
    expect(storageMock.remove).not.toHaveBeenCalledWith('guide:preferredRecipe');
  });

  it("selectMethod('v60') with preference → restores recipe", () => {
    storageMock.get.mockReturnValue('v60-suave');
    store.routeEntered();
    store.selectMethod('espresso');
    store.selectMethod('v60');

    expect(store.timer().mode).toBe('recipe');
    expect(currentPhase(store.timer()).id).toBe('v60-suave-1');
  });

  it('reset in recipe mode → 1st phase of recipe (zeroed)', () => {
    store.selectMethod('v60');
    store.selectRecipe('v60-suave');
    store.start();
    vi.advanceTimersByTime(5000);
    TestBed.flushEffects();

    store.reset();

    expect(store.timer().mode).toBe('recipe');
    expect(currentPhase(store.timer()).id).toBe('v60-suave-1');
    expect(store.timer().totalSeconds).toBe(0);
    expect(store.timer().phaseSeconds).toBe(0);
  });

  it('auto-advance via tick moves to next phase at targetSeconds', () => {
    store.selectMethod('v60');
    store.selectRecipe('v60-suave');
    store.start();
    TestBed.flushEffects();

    // v60-suave-1 has tempoObjetivo 30s — tick to 30s
    vi.advanceTimersByTime(30000);
    TestBed.flushEffects();

    expect(currentPhase(store.timer()).id).toBe('v60-suave-2');
    expect(store.timer().phaseSeconds).toBe(0);
    expect(store.timer().totalSeconds).toBe(30);
  });

  it('brewState in recipe mode → phaseLabel = recipe phase name', () => {
    store.selectMethod('v60');
    store.selectRecipe('v60-suave');
    store.setDose('20');
    store.start();
    vi.advanceTimersByTime(5000);
    TestBed.flushEffects();

    const state = store.brewState();
    expect(state.phase).toBe('v60-suave-1');
    expect(state.phaseLabel).toBe('Bloom');
    expect(state.totalTime).toBe(5);
  });

  it('selectedRecipe computed is null when no recipe selected', () => {
    expect(store.selectedRecipe()).toBeNull();
  });

  it('scaledActivePhases is empty when no recipe selected', () => {
    expect(store.scaledActivePhases()).toEqual([]);
  });

  it('scaledActivePhases returns scaled phases when recipe selected', () => {
    store.selectMethod('v60');
    store.setDose('15');
    store.selectRecipe('v60-suave');

    const phases = store.scaledActivePhases();
    expect(phases.length).toBe(4);
    // V60 ratio preset 16 → total sugerido = 15 * 16 = 240
    // Bloom: 40 * 240/300 = 32
    expect(phases[0].volumeAgua).toBe(32);
    // última fase = total sugerido
    expect(phases[3].volumeAgua).toBe(240);
  });

  it('selectRecipe with invalid id does nothing', () => {
    store.selectMethod('v60');
    store.selectRecipe('invalid-id');

    expect(store.timer().mode).toBe('simple');
    expect(storageMock.set).not.toHaveBeenCalledWith('guide:preferredRecipe', 'invalid-id');
  });
});
