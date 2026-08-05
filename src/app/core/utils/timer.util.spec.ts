import { createTimerState, tickTimer, advancePhase, formatMmSs } from './timer.util';
import { TimerState } from '../models/brew.model';

describe('createTimerState', () => {
  it('should return correct initial state', () => {
    const state = createTimerState();
    expect(state).toEqual({
      status: 'idle',
      phase: 'preinfusion',
      phaseSeconds: 0,
      totalSeconds: 0,
    });
  });
});

describe('tickTimer', () => {
  it('should increment phaseSeconds and totalSeconds when running', () => {
    const state: TimerState = { status: 'running', phase: 'preinfusion', phaseSeconds: 5, totalSeconds: 10 };
    const result = tickTimer(state);
    expect(result.phaseSeconds).toBe(6);
    expect(result.totalSeconds).toBe(11);
    expect(result.status).toBe('running');
    expect(result.phase).toBe('preinfusion');
  });

  it('should return same reference when idle', () => {
    const state = createTimerState();
    const result = tickTimer(state);
    expect(result).toBe(state);
  });

  it('should return same reference when paused', () => {
    const state: TimerState = { status: 'paused', phase: 'preinfusion', phaseSeconds: 3, totalSeconds: 3 };
    const result = tickTimer(state);
    expect(result).toBe(state);
  });
});

describe('advancePhase', () => {
  it('should transition from preinfusion to extraction and reset phaseSeconds', () => {
    const state: TimerState = { status: 'running', phase: 'preinfusion', phaseSeconds: 12, totalSeconds: 12 };
    const result = advancePhase(state);
    expect(result.phase).toBe('extraction');
    expect(result.phaseSeconds).toBe(0);
    expect(result.totalSeconds).toBe(12);
  });

  it('should return same reference when already extraction', () => {
    const state: TimerState = { status: 'running', phase: 'extraction', phaseSeconds: 5, totalSeconds: 20 };
    const result = advancePhase(state);
    expect(result).toBe(state);
  });
});

describe('formatMmSs', () => {
  it('should format 0 as 00:00', () => {
    expect(formatMmSs(0)).toBe('00:00');
  });

  it('should format 7 as 00:07', () => {
    expect(formatMmSs(7)).toBe('00:07');
  });

  it('should format 65 as 01:05', () => {
    expect(formatMmSs(65)).toBe('01:05');
  });

  it('should format 3600 as 60:00', () => {
    expect(formatMmSs(3600)).toBe('60:00');
  });

  it('should clamp negative values to 00:00', () => {
    expect(formatMmSs(-5)).toBe('00:00');
  });
});
