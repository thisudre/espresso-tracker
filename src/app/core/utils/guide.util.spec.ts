import { scaleVolume, scaledPhases, recipeToTimerPhases, recipeBaseTotal } from './guide.util';
import { RECIPES } from '../models/guide.model';

const equilibrada = RECIPES.find(r => r.id === 'v60-equilibrada')!;
const suave = RECIPES.find(r => r.id === 'v60-suave')!;

describe('scaleVolume', () => {
  it('should scale 40g at 25/20 of total', () => {
    expect(scaleVolume(40, 25, 20)).toBe(50);
  });

  it('should scale 160g at 25/20 of total', () => {
    expect(scaleVolume(160, 25, 20)).toBe(200);
  });

  it('should scale 300g at 25/20 of total', () => {
    expect(scaleVolume(300, 25, 20)).toBe(375);
  });

  it('should round correctly for 40g at 23/20 of total', () => {
    expect(scaleVolume(40, 23, 20)).toBe(46);
  });
});

describe('recipeBaseTotal', () => {
  it('should return the last accumulated phase volume', () => {
    expect(recipeBaseTotal(equilibrada)).toBe(300);
    expect(recipeBaseTotal(suave)).toBe(300);
  });
});

describe('scaledPhases', () => {
  it('should scale volumes as percentages of the total water', () => {
    const result = scaledPhases(equilibrada, 375);
    expect(result[0].volumeAgua).toBe(50);
    expect(result[1].volumeAgua).toBe(200);
    expect(result[2].volumeAgua).toBe(375);
  });

  it('should make the last phase equal the total water', () => {
    const result = scaledPhases(equilibrada, 320);
    expect(result[0].volumeAgua).toBe(43);
    expect(result[1].volumeAgua).toBe(171);
    expect(result[2].volumeAgua).toBe(320);
  });

  it('should keep times fixed regardless of total', () => {
    const result = scaledPhases(equilibrada, 375);
    expect(result[0].tempoObjetivo).toBe(30);
    expect(result[1].tempoObjetivo).toBe(75);
    expect(result[2].tempoObjetivo).toBe(150);
  });

  it('should use base volumes when total is null', () => {
    const result = scaledPhases(equilibrada, null);
    expect(result[0].volumeAgua).toBe(40);
    expect(result[1].volumeAgua).toBe(160);
    expect(result[2].volumeAgua).toBe(300);
  });

  it('should return unchanged volumes when total equals base total', () => {
    const result = scaledPhases(equilibrada, 300);
    expect(result[0].volumeAgua).toBe(40);
    expect(result[1].volumeAgua).toBe(160);
    expect(result[2].volumeAgua).toBe(300);
  });

  it('should return same number of phases as recipe', () => {
    const result = scaledPhases(equilibrada, 375);
    expect(result.length).toBe(equilibrada.fases.length);
  });

  it('should preserve phase names and descriptions', () => {
    const result = scaledPhases(equilibrada, 375);
    expect(result[0].nome).toBe('Bloom');
    expect(result[0].descricao).toBe(equilibrada.fases[0].descricao);
  });
});

describe('recipeToTimerPhases', () => {
  it('should map Suave recipe phases to TimerPhases', () => {
    const result = recipeToTimerPhases(suave);
    expect(result.map(p => p.targetSeconds)).toEqual([30, 60, 90, 180]);
  });

  it('should map phase names to labels', () => {
    const result = recipeToTimerPhases(suave);
    expect(result.map(p => p.label)).toEqual([
      'Bloom',
      '1ª Vertida',
      '2ª Vertida',
      'Finalização',
    ]);
  });

  it('should preserve phase ids', () => {
    const result = recipeToTimerPhases(suave);
    expect(result.map(p => p.id)).toEqual([
      'v60-suave-1',
      'v60-suave-2',
      'v60-suave-3',
      'v60-suave-4',
    ]);
  });
});
