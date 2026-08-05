export const DEGASS_WINDOW_MIN = 3;
export const DEGASS_WINDOW_MAX = 14;

export type DegassState = 'fresco' | 'ideal' | 'passou';

export interface DegassInfo {
  state: DegassState;
  days: number;
  label: string;
}

function normalizeToMidnight(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatLabel(state: DegassState, days: number): string {
  const displayDays = Math.max(0, days);
  switch (state) {
    case 'fresco':
      return `Muito fresco (${displayDays}d)`;
    case 'ideal':
      return `No ideal (${displayDays}d)`;
    case 'passou':
      return `Passou do ideal (${displayDays}d)`;
  }
}

export function degassInfo(
  roastDate: string | null | undefined,
  today: Date = new Date(),
): DegassInfo | null {
  if (roastDate == null) {
    return null;
  }

  const parsed = Date.parse(roastDate);
  if (isNaN(parsed)) {
    return null;
  }

  const roast = normalizeToMidnight(new Date(parsed));
  const todayMidnight = normalizeToMidnight(today);
  const days = Math.floor(
    (todayMidnight.getTime() - roast.getTime()) / 86_400_000,
  );

  let state: DegassState;
  if (days < DEGASS_WINDOW_MIN) {
    state = 'fresco';
  } else if (days <= DEGASS_WINDOW_MAX) {
    state = 'ideal';
  } else {
    state = 'passou';
  }

  return { state, days, label: formatLabel(state, days) };
}
