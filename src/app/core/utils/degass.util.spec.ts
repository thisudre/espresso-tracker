import {
  degassInfo,
  DEGASS_WINDOW_MIN,
  DEGASS_WINDOW_MAX,
} from './degass.util';

describe('degassInfo', () => {
  function daysAgo(n: number, base: Date = new Date('2025-06-15T12:00:00')): Date {
    const d = new Date(base);
    d.setDate(d.getDate() - n);
    return d;
  }

  const base = new Date('2025-06-15T12:00:00');

  it('should return null when roastDate is null', () => {
    expect(degassInfo(null, base)).toBeNull();
  });

  it('should return null when roastDate is undefined', () => {
    expect(degassInfo(undefined, base)).toBeNull();
  });

  it('should return null for an invalid date string', () => {
    expect(degassInfo('not-a-date', base)).toBeNull();
  });

  it('should return null for empty string', () => {
    expect(degassInfo('', base)).toBeNull();
  });

  it('should return fresco with 0d clamp for a future date', () => {
    const future = daysAgo(-2, base);
    const result = degassInfo(future.toISOString(), base);
    expect(result).toEqual({
      state: 'fresco',
      days: -2,
      label: 'Muito fresco (0d)',
    });
  });

  it('should return fresco for 0 days (today)', () => {
    const result = degassInfo(base.toISOString(), base);
    expect(result).toEqual({
      state: 'fresco',
      days: 0,
      label: 'Muito fresco (0d)',
    });
  });

  it('should return fresco for 2 days (< MIN boundary)', () => {
    const roast = daysAgo(2, base);
    const result = degassInfo(roast.toISOString(), base);
    expect(result).toEqual({
      state: 'fresco',
      days: 2,
      label: 'Muito fresco (2d)',
    });
  });

  it('should return ideal for 3 days (MIN boundary)', () => {
    const roast = daysAgo(DEGASS_WINDOW_MIN, base);
    const result = degassInfo(roast.toISOString(), base);
    expect(result).toEqual({
      state: 'ideal',
      days: 3,
      label: 'No ideal (3d)',
    });
  });

  it('should return ideal for 7 days (mid-range)', () => {
    const roast = daysAgo(7, base);
    const result = degassInfo(roast.toISOString(), base);
    expect(result).toEqual({
      state: 'ideal',
      days: 7,
      label: 'No ideal (7d)',
    });
  });

  it('should return ideal for 14 days (MAX boundary)', () => {
    const roast = daysAgo(DEGASS_WINDOW_MAX, base);
    const result = degassInfo(roast.toISOString(), base);
    expect(result).toEqual({
      state: 'ideal',
      days: 14,
      label: 'No ideal (14d)',
    });
  });

  it('should return passou for 15 days (> MAX boundary)', () => {
    const roast = daysAgo(15, base);
    const result = degassInfo(roast.toISOString(), base);
    expect(result).toEqual({
      state: 'passou',
      days: 15,
      label: 'Passou do ideal (15d)',
    });
  });

  it('should return passou for 20 days', () => {
    const roast = daysAgo(20, base);
    const result = degassInfo(roast.toISOString(), base);
    expect(result).toEqual({
      state: 'passou',
      days: 20,
      label: 'Passou do ideal (20d)',
    });
  });

  it('should normalize dates to midnight for day counting', () => {
    const today = new Date('2025-06-15T23:59:59');
    const roast = new Date('2025-06-15T00:00:01');
    const result = degassInfo(roast.toISOString(), today);
    expect(result?.days).toBe(0);
    expect(result?.state).toBe('fresco');
  });
});
