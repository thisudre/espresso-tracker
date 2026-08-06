import {
  createTimerState,
  createRecipeTimerState,
  currentPhase,
  tickTimer,
  advancePhase,
  formatMmSs,
  SIMPLE_PHASES,
} from './timer.util';
import { TimerState, TimerPhase } from '../models/brew.model';

describe('createTimerState', () => {
  it('should return simple mode with correct initial state', () => {
    const state = createTimerState();
    expect(state.status).toBe('idle');
    expect(state.mode).toBe('simple');
    expect(state.phaseIndex).toBe(0);
    expect(state.phases).toEqual(SIMPLE_PHASES);
    expect(state.phaseSeconds).toBe(0);
    expect(state.totalSeconds).toBe(0);
    expect(state.completed).toBe(false);
  });

  it('should have 2 phases in simple mode', () => {
    const state = createTimerState();
    expect(state.phases.length).toBe(2);
    expect(state.phases[0].id).toBe('preinfusion');
    expect(state.phases[1].id).toBe('extraction');
  });
});

describe('createRecipeTimerState', () => {
  it('should return recipe mode with given phases', () => {
    const phases: TimerPhase[] = [
      { id: 'bloom', label: 'Bloom', targetSeconds: 30 },
      { id: 'pour', label: 'Pour', targetSeconds: 60 },
    ];
    const state = createRecipeTimerState(phases);
    expect(state.status).toBe('idle');
    expect(state.mode).toBe('recipe');
    expect(state.phaseIndex).toBe(0);
    expect(state.phases).toBe(phases);
    expect(state.phaseSeconds).toBe(0);
    expect(state.totalSeconds).toBe(0);
    expect(state.completed).toBe(false);
  });
});

describe('currentPhase', () => {
  it('should return phases[phaseIndex]', () => {
    const state = createTimerState();
    expect(currentPhase(state).id).toBe('preinfusion');
  });

  it('should return correct phase after advancing index', () => {
    const state = createTimerState();
    const advanced = { ...state, phaseIndex: 1 };
    expect(currentPhase(advanced).id).toBe('extraction');
  });
});

describe('tickTimer — simple mode', () => {
  it('should increment phaseSeconds and totalSeconds when running', () => {
    const state: TimerState = {
      status: 'running',
      mode: 'simple',
      phaseIndex: 0,
      phases: SIMPLE_PHASES,
      phaseSeconds: 5,
      totalSeconds: 10,
      completed: false,
    };
    const result = tickTimer(state);
    expect(result.phaseSeconds).toBe(6);
    expect(result.totalSeconds).toBe(11);
    expect(result.status).toBe('running');
    expect(result.phaseIndex).toBe(0);
  });

  it('should return same reference when idle', () => {
    const state = createTimerState();
    const result = tickTimer(state);
    expect(result).toBe(state);
  });

  it('should return same reference when paused', () => {
    const state: TimerState = {
      status: 'paused',
      mode: 'simple',
      phaseIndex: 0,
      phases: SIMPLE_PHASES,
      phaseSeconds: 3,
      totalSeconds: 3,
      completed: false,
    };
    const result = tickTimer(state);
    expect(result).toBe(state);
  });
});

describe('tickTimer — recipe mode', () => {
  const recipePhases: TimerPhase[] = [
    { id: 'bloom', label: 'Bloom', targetSeconds: 30 },
    { id: 'pour', label: 'Pour', targetSeconds: 90 },
  ];

  it('should increment both seconds when running and before target', () => {
    const state: TimerState = {
      status: 'running',
      mode: 'recipe',
      phaseIndex: 0,
      phases: recipePhases,
      phaseSeconds: 10,
      totalSeconds: 10,
      completed: false,
    };
    const result = tickTimer(state);
    expect(result.phaseSeconds).toBe(11);
    expect(result.totalSeconds).toBe(11);
    expect(result.phaseIndex).toBe(0);
  });

  it('should advance to next phase when targetSeconds is hit', () => {
    const state: TimerState = {
      status: 'running',
      mode: 'recipe',
      phaseIndex: 0,
      phases: recipePhases,
      phaseSeconds: 28,
      totalSeconds: 28,
      completed: false,
    };
    const result = tickTimer(state);
    // totalSeconds 29 < 30, no advance yet
    expect(result.phaseIndex).toBe(0);
    expect(result.totalSeconds).toBe(29);
  });

  it('should advance to next phase when totalSeconds >= targetSeconds', () => {
    const state: TimerState = {
      status: 'running',
      mode: 'recipe',
      phaseIndex: 0,
      phases: recipePhases,
      phaseSeconds: 29,
      totalSeconds: 29,
      completed: false,
    };
    const result = tickTimer(state);
    // newTotalSeconds = 30 >= targetSeconds 30 → advance
    expect(result.phaseIndex).toBe(1);
    expect(result.phaseSeconds).toBe(0);
    expect(result.totalSeconds).toBe(30);
    expect(result.completed).toBe(false);
  });

  it('should mark completed when last phase hits target', () => {
    const state: TimerState = {
      status: 'running',
      mode: 'recipe',
      phaseIndex: 1,
      phases: recipePhases,
      phaseSeconds: 59,
      totalSeconds: 89,
      completed: false,
    };
    const result = tickTimer(state);
    // newTotalSeconds = 90 >= targetSeconds 90 → last phase, completed
    expect(result.completed).toBe(true);
    expect(result.totalSeconds).toBe(90);
    expect(result.phaseSeconds).toBe(60);
  });

  it('should increment total but not advance when completed', () => {
    const state: TimerState = {
      status: 'running',
      mode: 'recipe',
      phaseIndex: 1,
      phases: recipePhases,
      phaseSeconds: 60,
      totalSeconds: 90,
      completed: true,
    };
    const result = tickTimer(state);
    expect(result.totalSeconds).toBe(91);
    expect(result.phaseSeconds).toBe(61);
    expect(result.completed).toBe(true);
    expect(result.phaseIndex).toBe(1);
  });

  it('should return same reference when idle', () => {
    const state = createRecipeTimerState(recipePhases);
    const result = tickTimer(state);
    expect(result).toBe(state);
  });

  it('should return same reference when paused', () => {
    const state: TimerState = {
      status: 'paused',
      mode: 'recipe',
      phaseIndex: 0,
      phases: recipePhases,
      phaseSeconds: 5,
      totalSeconds: 5,
      completed: false,
    };
    const result = tickTimer(state);
    expect(result).toBe(state);
  });
});

describe('advancePhase — simple mode', () => {
  it('should transition from preinfusion to extraction and reset phaseSeconds', () => {
    const state: TimerState = {
      status: 'running',
      mode: 'simple',
      phaseIndex: 0,
      phases: SIMPLE_PHASES,
      phaseSeconds: 12,
      totalSeconds: 12,
      completed: false,
    };
    const result = advancePhase(state);
    expect(currentPhase(result).id).toBe('extraction');
    expect(result.phaseSeconds).toBe(0);
    expect(result.totalSeconds).toBe(12);
  });

  it('should return same reference when already extraction', () => {
    const state: TimerState = {
      status: 'running',
      mode: 'simple',
      phaseIndex: 1,
      phases: SIMPLE_PHASES,
      phaseSeconds: 5,
      totalSeconds: 20,
      completed: false,
    };
    const result = advancePhase(state);
    expect(result).toBe(state);
  });
});

describe('advancePhase — recipe mode', () => {
  const recipePhases: TimerPhase[] = [
    { id: 'bloom', label: 'Bloom', targetSeconds: 30 },
    { id: 'pour', label: 'Pour', targetSeconds: 90 },
  ];

  it('should advance to next phase when not last', () => {
    const state: TimerState = {
      status: 'running',
      mode: 'recipe',
      phaseIndex: 0,
      phases: recipePhases,
      phaseSeconds: 15,
      totalSeconds: 15,
      completed: false,
    };
    const result = advancePhase(state);
    expect(result.phaseIndex).toBe(1);
    expect(result.phaseSeconds).toBe(0);
    expect(result.totalSeconds).toBe(15);
    expect(result.completed).toBe(false);
  });

  it('should mark completed when advancing from last phase', () => {
    const state: TimerState = {
      status: 'running',
      mode: 'recipe',
      phaseIndex: 1,
      phases: recipePhases,
      phaseSeconds: 30,
      totalSeconds: 60,
      completed: false,
    };
    const result = advancePhase(state);
    expect(result.completed).toBe(true);
    expect(result.phaseIndex).toBe(1);
  });

  it('should return same reference when already completed', () => {
    const state: TimerState = {
      status: 'running',
      mode: 'recipe',
      phaseIndex: 1,
      phases: recipePhases,
      phaseSeconds: 60,
      totalSeconds: 90,
      completed: true,
    };
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
