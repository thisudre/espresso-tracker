export type BeanProcess = 'Washed' | 'Natural' | 'Honey' | 'Outro';

export type BeanStatus = 'aberto' | 'fechado' | 'finalizado';

export const STATUS_LABEL: Record<BeanStatus, string> = {
  aberto: 'Aberto',
  fechado: 'Fechado',
  finalizado: 'Finalizado',
};

export const STATUS_ORDER: BeanStatus[] = ['aberto', 'fechado', 'finalizado'];

export const DEFAULT_BEAN_STATUS: BeanStatus = 'fechado';

export interface Bean {
  id: string;
  brand: string;
  origin?: string;
  variety?: string;
  process?: BeanProcess;
  roastDate?: string;
  notes?: string;
  status: BeanStatus;
  createdAt: string;
}
