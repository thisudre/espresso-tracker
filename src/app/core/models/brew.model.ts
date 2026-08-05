export type BrewMethod = 'espresso' | 'v60' | 'prensa' | 'aeropress';
export type BrewPhase = 'preinfusion' | 'extraction';
export type TimerStatus = 'idle' | 'running' | 'paused';

export interface BrewMethodInfo {
  id: BrewMethod;
  label: string;
}

export const BREW_METHODS: BrewMethodInfo[] = [
  { id: 'espresso', label: 'Espresso' },
  { id: 'v60', label: 'Coado/V60' },
  { id: 'prensa', label: 'Prensa Francesa' },
  { id: 'aeropress', label: 'Aeropress' },
];

export const RATIO_PRESETS: Record<BrewMethod, number> = {
  espresso: 2,
  v60: 16,
  prensa: 15,
  aeropress: 15,
};

export const PHASE_LABEL: Record<BrewPhase, string> = {
  preinfusion: 'Pré-infusão',
  extraction: 'Extração',
};

export interface TimerState {
  status: TimerStatus;
  phase: BrewPhase;
  phaseSeconds: number;
  totalSeconds: number;
}

export interface BrewState {
  method: BrewMethod;
  methodLabel: string;
  dose: number | null;
  ratio: number | null;
  water: number | null;
  phase: BrewPhase;
  phaseLabel: string;
  phaseTime: number;
  totalTime: number;
  running: boolean;
}
