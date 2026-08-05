import { TestBed } from '@angular/core/testing';
import { ExtractionStore } from './extraction.store';

describe('ExtractionStore', () => {
  let store: ExtractionStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    vi.useFakeTimers();
    store = TestBed.inject(ExtractionStore);
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
    expect(store.timer().phase).toBe('preinfusion');
    expect(store.timer().phaseSeconds).toBe(0);
    expect(store.timer().totalSeconds).toBe(0);
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
    expect(store.timer().phase).toBe('preinfusion');
    expect(store.timer().phaseSeconds).toBe(0);
    expect(store.timer().totalSeconds).toBe(0);
  });

  it('advancePhase moves from preinfusion to extraction with phaseSeconds 0', () => {
    store.start();
    vi.advanceTimersByTime(5000);
    TestBed.flushEffects();

    store.advancePhase();

    expect(store.timer().phase).toBe('extraction');
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
});
