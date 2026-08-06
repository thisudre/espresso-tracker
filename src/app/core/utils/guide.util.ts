import { TimerPhase } from '../models/brew.model';
import { ExtractionRecipe } from '../models/guide.model';

export interface ScaledPhase {
  nome: string;
  volumeAgua: number;
  tempoObjetivo: number;
  descricao: string;
}

export function scaleVolume(volume: number, dose: number, baseDose: number): number {
  return Math.round(volume * dose / baseDose);
}

export function scaledPhases(recipe: ExtractionRecipe, dose: number | null): ScaledPhase[] {
  const effectiveDose = dose ?? recipe.baseDose;
  return recipe.fases.map(f => ({
    nome: f.nome,
    volumeAgua: scaleVolume(f.volumeAgua, effectiveDose, recipe.baseDose),
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
