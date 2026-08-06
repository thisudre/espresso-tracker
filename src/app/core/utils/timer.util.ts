import { TimerState, TimerPhase, PHASE_LABEL } from '../models/brew.model';

export const SIMPLE_PHASES: TimerPhase[] = [
  { id: 'preinfusion', label: PHASE_LABEL['preinfusion'], targetSeconds: null },
  { id: 'extraction', label: PHASE_LABEL['extraction'], targetSeconds: null },
];

export function createTimerState(): TimerState {
  return {
    status: 'idle',
    mode: 'simple',
    phaseIndex: 0,
    phases: SIMPLE_PHASES,
    phaseSeconds: 0,
    totalSeconds: 0,
    completed: false,
  };
}

export function createRecipeTimerState(phases: TimerPhase[]): TimerState {
  return {
    status: 'idle',
    mode: 'recipe',
    phaseIndex: 0,
    phases,
    phaseSeconds: 0,
    totalSeconds: 0,
    completed: false,
  };
}

export function currentPhase(state: TimerState): TimerPhase {
  return state.phases[state.phaseIndex];
}

export function tickTimer(state: TimerState): TimerState {
  if (state.status !== 'running') return state;

  const newPhaseSeconds = state.phaseSeconds + 1;
  const newTotalSeconds = state.totalSeconds + 1;

  if (state.mode === 'recipe' && !state.completed) {
    const phase = currentPhase(state);
    if (phase.targetSeconds !== null && newTotalSeconds >= phase.targetSeconds) {
      const nextIndex = state.phaseIndex + 1;
      if (nextIndex >= state.phases.length) {
        return {
          ...state,
          phaseSeconds: newPhaseSeconds,
          totalSeconds: newTotalSeconds,
          completed: true,
        };
      }
      return {
        ...state,
        phaseIndex: nextIndex,
        phaseSeconds: 0,
        totalSeconds: newTotalSeconds,
      };
    }
  }

  return {
    ...state,
    phaseSeconds: newPhaseSeconds,
    totalSeconds: newTotalSeconds,
  };
}

export function advancePhase(state: TimerState): TimerState {
  if (state.mode === 'simple') {
    if (currentPhase(state).id !== 'preinfusion') return state;
    const extractionIndex = state.phases.findIndex(p => p.id === 'extraction');
    return { ...state, phaseIndex: extractionIndex, phaseSeconds: 0, totalSeconds: state.totalSeconds };
  }

  if (state.completed) return state;
  const nextIndex = state.phaseIndex + 1;
  if (nextIndex >= state.phases.length) {
    return { ...state, completed: true };
  }
  return { ...state, phaseIndex: nextIndex, phaseSeconds: 0, totalSeconds: state.totalSeconds };
}

export function formatMmSs(totalSeconds: number): string {
  const clamped = Math.max(0, totalSeconds);
  const mm = Math.floor(clamped / 60);
  const ss = clamped % 60;
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}
