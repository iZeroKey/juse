export interface JuseEvent {
  id: string;
  // General Info
  date: string;          // ISO date "2026-06-18"
  startTime: string;     // "14:00"
  endTime: string;       // "18:00"
  duration: number;      // Auto-calculated in minutes
  eventType: string;
  color?: string;        // ID of the color palette to use
  location: string;

  // Staff
  animadoras: string[];
  bailarinas: string[];
  dj: string[];
  staffAdicional: string[];
  munecos: string[];

  // Finances (all in S/)
  totalEvento: number;
  movilidad: number;
  adelanto: number;
  saldo: number;         // Auto: totalEvento - adelanto
  pagoPersonal: number;
  ganancia: number;
  observacion: string;

  // Meta
  createdAt: string;
  updatedAt: string;
}

export type CalendarView = 'week' | 'month';

export const EVENT_TYPES = [
  'Gincana',
  'Revelación de Género',
  'Baby Shower',
  'Cumpleaños',
  'Boda',
  'Corporativo',
  'Personalizado',
] as const;

export const DOCUMENT_TYPES = [
  'Factura',
  'Recibo por Honorarios',
  'Solo Contrato',
  'Sin Documento',
] as const;

export interface EventFormValues {
  date: string;
  startTime: string;
  endTime: string;
  eventType: string;
  color: string;
  location: string;
  animadoras: string[];
  bailarinas: string[];
  dj: string[];
  staffAdicional: string[];
  munecos: string[];
  totalEvento: string;
  movilidad: string;
  adelanto: string;
  saldo: string;
  pagoPersonal: string;
  ganancia: string;
  observacion: string;
}
