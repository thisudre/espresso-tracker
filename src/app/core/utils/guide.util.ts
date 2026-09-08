import { TimerPhase } from '../models/brew.model';
import { ExtractionRecipe } from '../models/guide.model';

export interface ScaledPhase {
  nome: string;
  volumeAgua: number;
  tempoObjetivo: number;
  descricao: string;
}

export function scaleVolume(volume: number, total: number, baseTotal: number): number {
  return Math.round(volume * total / baseTotal);
}

export function recipeBaseTotal(recipe: ExtractionRecipe): number {
  const last = recipe.fases[recipe.fases.length - 1];
  return last ? last.volumeAgua : 0;
}

export function scaledPhases(recipe: ExtractionRecipe, totalWater: number | null): ScaledPhase[] {
  const baseTotal = recipeBaseTotal(recipe);
  if (baseTotal <= 0) return [];
  const total = totalWater ?? baseTotal;
  return recipe.fases.map(f => ({
    nome: f.nome,
    volumeAgua: scaleVolume(f.volumeAgua, total, baseTotal),
    tempoObjetivo: f.tempoObjetivo,
    descricao: f.descricao,
  }));
}

export function recipeToTimerPhases(recipe: ExtractionRecipe): TimerPhase[] {
  return recipe.fases.map(f => ({
    id: f.id,
    label: f.nome,
    targetSeconds: f.tempoObjetivo,
  }));
}
