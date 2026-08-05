import type { BrewMethod } from './brew.model';

export type RatingKey = 'acidity' | 'body' | 'sweetness' | 'overall';

export const RATING_KEYS: RatingKey[] = ['acidity', 'body', 'sweetness', 'overall'];

export const RATING_LABELS: Record<RatingKey, string> = {
  acidity: 'Acidez',
  body: 'Corpo',
  sweetness: 'Doçura',
  overall: 'Nota Geral',
};

export const DEFAULT_LOG_METHOD: BrewMethod = 'espresso';

export interface BrewRating {
  acidity: number;
  body: number;
  sweetness: number;
  overall: number;
}

export interface BrewLog {
  id: string;
  method: BrewMethod;
  dose: number | null;
  water: number | null;
  grind?: string;
  beanId?: string;
  beanName?: string;
  totalSeconds: number;
  rating: BrewRating;
  notes?: string;
  createdAt: string;
}
