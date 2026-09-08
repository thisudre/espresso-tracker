import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { BrewMethod, TimerState, BrewState, RATIO_PRESETS } from '../models/brew.model';
import { parsePositiveNumber, suggestedWater } from '../utils/brew-ratio.util';
import { createRecipeTimerState, createTimerState, tickTimer, advancePhase as advancePhaseUtil, currentPhase as currentPhaseUtil } from '../utils/timer.util';
import { recipeToTimerPhases, scaledPhases } from '../utils/guide.util';
import { RECIPES_BY_ID } from '../models/guide.model';
import { BREW_METHODS } from '../models/brew.model';
import { GuideStore } from './guide.store';

@Injectable({ providedIn: 'root' })
export class ExtractionStore {
  private guideStore = inject(GuideStore);

  method = signal<BrewMethod>('espresso');
  doseInput = signal('');
  ratioInput = signal('2');
  timer = signal<TimerState>(createTimerState());

  water = computed(() => suggestedWater(this.doseInput(), this.ratioInput()));
  dose = computed(() => parsePositiveNumber(this.doseInput()));
  ratio = computed(() => parsePositiveNumber(this.ratioInput()));

  currentPhase = computed(() => currentPhaseUtil(this.timer()));
  currentPhaseLabel = computed(() => currentPhaseUtil(this.timer()).label);
  currentPhaseTarget = computed(() => currentPhaseUtil(this.timer()).targetSeconds);
  isRecipeMode = computed(() => this.timer().mode === 'recipe');
  isCompleted = computed(() => this.timer().completed);
  selectedRecipe = computed(() => this.guideStore.selectedRecipe());
  scaledActivePhases = computed(() => {
    const recipe = this.selectedRecipe();
    return recipe ? scaledPhases(recipe, this.water()) : [];
  });

  brewState = computed<BrewState>(() => {
    const t = this.timer();
    const method = this.method();
    const methodLabel = BREW_METHODS.find(m => m.id === method)?.label ?? method;
    const cp = currentPhaseUtil(t);
    return {
      method,
      methodLabel,
      dose: this.dose(),
      ratio: this.ratio(),
      water: this.water(),
      phase: cp.id,
      phaseLabel: cp.label,
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
    const wasRecipeMode = this.timer().mode === 'recipe';
    this.method.set(m);
    this.ratioInput.set(String(RATIO_PRESETS[m]));

    if (m !== 'v60' && wasRecipeMode) {
      this.running.set(false);
      this.timer.set(createTimerState());
    } else if (m === 'v60' && this.guideStore.selectedRecipe()) {
      this.running.set(false);
      const recipe = this.guideStore.selectedRecipe()!;
      this.timer.set(createRecipeTimerState(recipeToTimerPhases(recipe)));
    }
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
    if (this.timer().mode === 'recipe') {
      const recipe = this.selectedRecipe();
      if (recipe) {
        this.timer.set(createRecipeTimerState(recipeToTimerPhases(recipe)));
        return;
      }
    }
    this.timer.set(createTimerState());
  }

  advancePhase(): void {
    this.timer.set(advancePhaseUtil(this.timer()));
  }

  routeExited(): void {
    this.reset();
  }

  routeEntered(): void {
    this.guideStore.restorePreference();
    const recipe = this.guideStore.selectedRecipe();
    if (recipe && recipe.method === this.method()) {
      this.running.set(false);
      this.timer.set(createRecipeTimerState(recipeToTimerPhases(recipe)));
    } else {
      this.running.set(false);
      this.timer.set(createTimerState());
    }
  }

  selectRecipe(id: string): void {
    const recipe = RECIPES_BY_ID[id];
    if (!recipe) return;
    this.guideStore.select(id);
    this.running.set(false);
    this.timer.set(createRecipeTimerState(recipeToTimerPhases(recipe)));
  }

  exitRecipe(): void {
    this.guideStore.clearPreference();
    this.running.set(false);
    this.timer.set(createTimerState());
  }

  private tick(): void {
    this.timer.set(tickTimer(this.timer()));
  }
}
