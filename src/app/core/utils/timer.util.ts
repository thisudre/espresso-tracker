import { TimerState } from '../models/brew.model';

export function createTimerState(): TimerState {
  return { status: 'idle', phase: 'preinfusion', phaseSeconds: 0, totalSeconds: 0 };
}

export function tickTimer(state: TimerState): TimerState {
  if (state.status !== 'running') return state;
  return { ...state, phaseSeconds: state.phaseSeconds + 1, totalSeconds: state.totalSeconds + 1 };
}

export function advancePhase(state: TimerState): TimerState {
  if (state.phase !== 'preinfusion') return state;
  return { ...state, phase: 'extraction', phaseSeconds: 0, totalSeconds: state.totalSeconds };
}

export function formatMmSs(totalSeconds: number): string {
  const clamped = Math.max(0, totalSeconds);
  const mm = Math.floor(clamped / 60);
  const ss = clamped % 60;
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}
