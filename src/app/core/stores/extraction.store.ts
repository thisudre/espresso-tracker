import { Injectable, signal, computed, effect } from '@angular/core';
import { BrewMethod, TimerState, BrewState, RATIO_PRESETS, PHASE_LABEL } from '../models/brew.model';
import { parsePositiveNumber, suggestedWater } from '../utils/brew-ratio.util';
import { createTimerState, tickTimer, advancePhase as advancePhaseUtil } from '../utils/timer.util';
import { BREW_METHODS } from '../models/brew.model';

@Injectable({ providedIn: 'root' })
export class ExtractionStore {
  method = signal<BrewMethod>('espresso');
  doseInput = signal('');
  ratioInput = signal('2');
  timer = signal<TimerState>(createTimerState());

  water = computed(() => suggestedWater(this.doseInput(), this.ratioInput()));
  dose = computed(() => parsePositiveNumber(this.doseInput()));
  ratio = computed(() => parsePositiveNumber(this.ratioInput()));
  brewState = computed<BrewState>(() => {
    const t = this.timer();
    const method = this.method();
    const methodLabel = BREW_METHODS.find(m => m.id === method)?.label ?? method;
    return {
      method,
      methodLabel,
      dose: this.dose(),
      ratio: this.ratio(),
      water: this.water(),
      phase: t.phase,
      phaseLabel: PHASE_LABEL[t.phase],
      phaseTime: t.phaseSeconds,
      totalTime: t.totalSeconds,
      running: t.status === 'running',
    };
  });

  private intervalId: ReturnType<typeof setInterval> | null = null;
  private running = signal(false);

  constructor() {
    effect(() => {
      const isRunning = this.running();
      if (isRunning) {
        this.intervalId = setInterval(() => this.tick(), 1000);
        return () => {
          if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
          }
        };
      }
      if (this.intervalId !== null) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
      return undefined;
    });
  }

  selectMethod(m: BrewMethod): void {
    this.method.set(m);
    this.ratioInput.set(String(RATIO_PRESETS[m]));
  }

  setDose(v: string): void {
    this.doseInput.set(v);
  }

  setRatio(v: string): void {
    this.ratioInput.set(v);
  }

  start(): void {
    this.running.set(true);
    this.timer.update(s => ({ ...s, status: 'running' }));
  }

  pause(): void {
    this.running.set(false);
    this.timer.update(s => ({ ...s, status: 'paused' }));
  }

  reset(): void {
    this.running.set(false);
    this.timer.set(createTimerState());
  }

  advancePhase(): void {
    this.timer.set(advancePhaseUtil(this.timer()));
  }

  routeExited(): void {
    this.reset();
  }

  private tick(): void {
    this.timer.set(tickTimer(this.timer()));
  }
}
