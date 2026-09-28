import { scaleVolume, scaledPhases, recipeToTimerPhases, recipeBaseTotal } from './guide.util';
import { ExtractionRecipe } from '../models/guide.model';

// Fixtures locais — RECIPES estático foi removido do modelo (backend-guides FE-01).
const equilibrada: ExtractionRecipe = {
  id: 'v60-equilibrada',
  method: 'v60',
  nome: 'V60 Equilibrada',
  foco: 'Doçura e corpo médio',
  moagem: 'padrão',
  baseDose: 20,
  tempoTotalEstimado: 150,
  fases: [
    { id: 'v60-equilibrada-1', nome: 'Bloom', tempoObjetivo: 30, volumeAgua: 40, descricao: 'Despeje 40g de água em círculos suaves e aguarde 30s.' },
    { id: 'v60-equilibrada-2', nome: 'Vertida Principal', tempoObjetivo: 75, volumeAgua: 160, descricao: 'Adicione água até 160g e aguarde até 1m15s.' },
    { id: 'v60-equilibrada-3', nome: 'Finalização', tempoObjetivo: 150, volumeAgua: 300, descricao: 'Adicione até 300g e aguarde a extração terminar.' },
  ],
};

const suave: ExtractionRecipe = {
  id: 'v60-suave',
  method: 'v60',
  nome: 'V60 Suave',
  foco: 'Doçura prolongada',
  moagem: 'um pouco mais grossa',
  baseDose: 20,
  tempoTotalEstimado: 180,
  fases: [
    { id: 'v60-suave-1', nome: 'Bloom', tempoObjetivo: 30, volumeAgua: 40, descricao: 'Despeje 40g de água e aguarde 30s.' },
    { id: 'v60-suave-2', nome: '1ª Vertida', tempoObjetivo: 60, volumeAgua: 150, descricao: 'Adicione até 150g e aguarde 30s.' },
    { id: 'v60-suave-3', nome: '2ª Vertida', tempoObjetivo: 90, volumeAgua: 225, descricao: 'Adicione até 225g e aguarde 30s.' },
    { id: 'v60-suave-4', nome: 'Finalização', tempoObjetivo: 180, volumeAgua: 300, descricao: 'Adicione até 300g e aguarde a extração terminar.' },
  ],
};

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
