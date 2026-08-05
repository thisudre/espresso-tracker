import { parsePositiveNumber, suggestedWater } from './brew-ratio.util';
import { RATIO_PRESETS } from '../models/brew.model';

describe('parsePositiveNumber', () => {
  it('should return null for empty string', () => {
    expect(parsePositiveNumber('')).toBeNull();
  });

  it('should return null for whitespace-only string', () => {
    expect(parsePositiveNumber('   ')).toBeNull();
  });

  it('should return null for non-numeric string', () => {
    expect(parsePositiveNumber('abc')).toBeNull();
  });

  it('should return null for zero', () => {
    expect(parsePositiveNumber('0')).toBeNull();
  });

  it('should return null for negative number', () => {
    expect(parsePositiveNumber('-5')).toBeNull();
  });

  it('should return the number for positive integer', () => {
    expect(parsePositiveNumber('15')).toBe(15);
  });

  it('should return the number for positive decimal with dot separator', () => {
    expect(parsePositiveNumber('10.5')).toBe(10.5);
  });
});

describe('suggestedWater', () => {
  it('should calculate water for valid dose and ratio', () => {
    expect(suggestedWater('15', '16')).toBe(240);
  });

  it('should round the result', () => {
    expect(suggestedWater('10.3', '16')).toBe(165);
  });

  it('should return null when dose is empty', () => {
    expect(suggestedWater('', '16')).toBeNull();
  });

  it('should return null when dose is zero', () => {
    expect(suggestedWater('0', '16')).toBeNull();
  });

  it('should return null when dose is negative', () => {
    expect(suggestedWater('-5', '16')).toBeNull();
  });

  it('should return null when dose is non-numeric', () => {
    expect(suggestedWater('abc', '16')).toBeNull();
  });

  it('should return null when ratio is empty', () => {
    expect(suggestedWater('15', '')).toBeNull();
  });

  it('should return null when ratio is zero', () => {
    expect(suggestedWater('15', '0')).toBeNull();
  });

  it('should return null when ratio is negative', () => {
    expect(suggestedWater('15', '-16')).toBeNull();
  });

  it('should return null when ratio is non-numeric', () => {
    expect(suggestedWater('15', 'xyz')).toBeNull();
  });
});

describe('RATIO_PRESETS', () => {
  it('should have espresso preset equal to 2', () => {
    expect(RATIO_PRESETS.espresso).toBe(2);
  });

  it('should have v60 preset equal to 16', () => {
    expect(RATIO_PRESETS.v60).toBe(16);
  });

  it('should have prensa preset equal to 15', () => {
    expect(RATIO_PRESETS.prensa).toBe(15);
  });

  it('should have aeropress preset equal to 15', () => {
    expect(RATIO_PRESETS.aeropress).toBe(15);
  });
});
