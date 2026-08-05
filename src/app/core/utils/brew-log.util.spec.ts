import {
  deriveRatio,
  formatRatio,
  parseMmSs,
  mmSsValidator,
  filterLogs,
  hasRating,
  methodLabelFor,
} from './brew-log.util';
import { BrewLog } from '../models/brew-log.model';

describe('brew-log.util', () => {
  describe('deriveRatio', () => {
    it('returns water/dose when both > 0', () => {
      expect(deriveRatio(16, 256)).toBe(16);
    });

    it('returns fractional ratio', () => {
      expect(deriveRatio(18, 300)).toBeCloseTo(16.667, 2);
    });

    it('returns null when dose is null', () => {
      expect(deriveRatio(null, 256)).toBeNull();
    });

    it('returns null when water is null', () => {
      expect(deriveRatio(16, null)).toBeNull();
    });

    it('returns null when dose is 0', () => {
      expect(deriveRatio(0, 256)).toBeNull();
    });

    it('returns null when water is 0', () => {
      expect(deriveRatio(16, 0)).toBeNull();
    });

    it('returns null when both are null', () => {
      expect(deriveRatio(null, null)).toBeNull();
    });
  });

  describe('formatRatio', () => {
    it('formats integer ratio', () => {
      expect(formatRatio(16, 256)).toBe('1:16');
    });

    it('formats fractional ratio with 1 decimal', () => {
      expect(formatRatio(18, 300)).toBe('1:16.7');
    });

    it('returns null when dose is null', () => {
      expect(formatRatio(null, 256)).toBeNull();
    });

    it('returns null when water is null', () => {
      expect(formatRatio(16, null)).toBeNull();
    });

    it('returns null when both are null', () => {
      expect(formatRatio(null, null)).toBeNull();
    });
  });

  describe('parseMmSs', () => {
    it('parses 02:15 to 135 seconds', () => {
      expect(parseMmSs('02:15')).toBe(135);
    });

    it('parses 2:05 to 125 seconds', () => {
      expect(parseMmSs('2:05')).toBe(125);
    });

    it('parses 60:00 to 3600 seconds', () => {
      expect(parseMmSs('60:00')).toBe(3600);
    });

    it('parses 0:30 to 30 seconds', () => {
      expect(parseMmSs('0:30')).toBe(30);
    });

    it('returns null for empty string', () => {
      expect(parseMmSs('')).toBeNull();
    });

    it('returns null for whitespace only', () => {
      expect(parseMmSs('   ')).toBeNull();
    });

    it('returns null for invalid format', () => {
      expect(parseMmSs('ab:12')).toBeNull();
    });

    it('returns null for seconds > 59', () => {
      expect(parseMmSs('02:60')).toBeNull();
    });

    it('returns null for no colon', () => {
      expect(parseMmSs('135')).toBeNull();
    });

    it('returns null for too many digits in seconds', () => {
      expect(parseMmSs('1:123')).toBeNull();
    });
  });

  describe('mmSsValidator', () => {
    it('returns null for empty value', () => {
      expect(mmSsValidator({ value: '' })).toBeNull();
    });

    it('returns null for valid mm:ss', () => {
      expect(mmSsValidator({ value: '02:15' })).toBeNull();
    });

    it('returns error for invalid format', () => {
      expect(mmSsValidator({ value: 'ab:12' })).toEqual({ mmSs: true });
    });
  });

  describe('filterLogs', () => {
    const logs: BrewLog[] = [
      { id: '1', method: 'espresso', dose: 18, water: 36, totalSeconds: 30, rating: { acidity: 0, body: 0, sweetness: 0, overall: 0 }, createdAt: '', beanId: 'b1' },
      { id: '2', method: 'v60', dose: 15, water: 240, totalSeconds: 180, rating: { acidity: 0, body: 0, sweetness: 0, overall: 0 }, createdAt: '', beanId: 'b2' },
      { id: '3', method: 'espresso', dose: 20, water: 40, totalSeconds: 25, rating: { acidity: 0, body: 0, sweetness: 0, overall: 0 }, createdAt: '', beanId: 'b1' },
    ];

    it('returns all logs when no filters', () => {
      expect(filterLogs(logs, {})).toHaveLength(3);
    });

    it('filters by beanId', () => {
      expect(filterLogs(logs, { beanId: 'b1' })).toHaveLength(2);
    });

    it('filters by method', () => {
      expect(filterLogs(logs, { method: 'v60' })).toHaveLength(1);
    });

    it('filters by beanId AND method (combined)', () => {
      expect(filterLogs(logs, { beanId: 'b1', method: 'espresso' })).toHaveLength(2);
    });

    it('returns empty when no match', () => {
      expect(filterLogs(logs, { beanId: 'nonexistent' })).toHaveLength(0);
    });
  });

  describe('hasRating', () => {
    it('returns false when all zeros', () => {
      expect(hasRating({ acidity: 0, body: 0, sweetness: 0, overall: 0 })).toBe(false);
    });

    it('returns true when any field > 0', () => {
      expect(hasRating({ acidity: 3, body: 0, sweetness: 0, overall: 0 })).toBe(true);
    });

    it('returns true when overall > 0', () => {
      expect(hasRating({ acidity: 0, body: 0, sweetness: 0, overall: 5 })).toBe(true);
    });
  });

  describe('methodLabelFor', () => {
    it('returns label for valid method', () => {
      expect(methodLabelFor('espresso')).toBe('Espresso');
    });

    it('returns label for v60', () => {
      expect(methodLabelFor('v60')).toBe('Coado/V60');
    });

    it('returns fallback label for unknown method', () => {
      expect(methodLabelFor('unknown')).toBe('Espresso');
    });
  });
});
