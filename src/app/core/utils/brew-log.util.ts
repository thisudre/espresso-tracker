import { ValidationErrors } from '@angular/forms';
import { BrewMethod, BREW_METHODS } from '../models/brew.model';
import { BrewLog, BrewRating, DEFAULT_LOG_METHOD } from '../models/brew-log.model';
import { formatMmSs } from './timer.util';

export function deriveRatio(dose: number | null, water: number | null): number | null {
  if (dose === null || water === null || dose <= 0 || water <= 0) return null;
  return water / dose;
}

export function formatRatio(dose: number | null, water: number | null): string | null {
  const ratio = deriveRatio(dose, water);
  if (ratio === null) return null;
  const rounded = Math.round(ratio * 10) / 10;
  if (rounded === Math.floor(rounded)) {
    return `1:${Math.floor(rounded)}`;
  }
  return `1:${rounded}`;
}

export function parseMmSs(value: string): number | null {
  if (!value || value.trim() === '') return null;
  const match = value.trim().match(/^(\d{1,3}):(\d{2})$/);
  if (!match) return null;
  const mm = parseInt(match[1], 10);
  const ss = parseInt(match[2], 10);
  if (ss > 59) return null;
  return mm * 60 + ss;
}

export function mmSsValidator(control: { value: string }): ValidationErrors | null {
  if (!control.value || control.value.trim() === '') return null;
  return parseMmSs(control.value) === null ? { mmSs: true } : null;
}

export function filterLogs(
  logs: BrewLog[],
  filters: { beanId?: string | null; method?: BrewMethod | null }
): BrewLog[] {
  return logs.filter((log) => {
    if (filters.beanId && log.beanId !== filters.beanId) return false;
    if (filters.method && log.method !== filters.method) return false;
    return true;
  });
}

export function hasRating(rating: BrewRating): boolean {
  return rating.acidity > 0 || rating.body > 0 || rating.sweetness > 0 || rating.overall > 0;
}

export function methodLabelFor(method: string): string {
  const found = BREW_METHODS.find((m) => m.id === method);
  return found?.label ?? BREW_METHODS.find((m) => m.id === DEFAULT_LOG_METHOD)!.label;
}
