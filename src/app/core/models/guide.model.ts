export type GuideMethod = 'v60';
export interface RecipePhase { id: string; nome: string; tempoObjetivo: number; volumeAgua: number; descricao: string; }
export interface ExtractionRecipe { id: string; method: GuideMethod; nome: string; foco: string; moagem: string; baseDose: number; tempoTotalEstimado: number; fases: RecipePhase[]; }
