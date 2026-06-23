export interface JuseEvent {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  eventType: string;
  color?: string;
  location: string;
  tematica: string;
  contactoNombre: string;
  contactoNumero: string;
  animadores: string[];
  bailarines: string[];
  dj: string[];
  staffLucido: string[];
  staffApoyo: string[];
  muneco: string[];
  videoFotografia: string[];
  payaso: string[];
  showMagia: string[];
  totalEvento: number;
  movilidad: number;
  adelanto: number;
  saldo: number;
  pagoPersonal: number;
  ganancia: number;
  observacion: string;
  createdAt: string;
  updatedAt: string;
}

export type CalendarView = "week" | "month";

export const EVENT_TYPES = [
  "Gincana",
  "Revelación de Género",
  "Baby Shower",
  "Cumpleaños",
  "Boda",
  "Corporativo",
  "Personalizado",
] as const;

export const DOCUMENT_TYPES = [
  "Factura",
  "Recibo por Honorarios",
  "Solo Contrato",
  "Sin Documento",
] as const;

export interface EventFormValues {
  date: string;
  startTime: string;
  endTime: string;
  eventType: string;
  color: string;
  location: string;
  tematica: string;
  contactoNombre: string;
  contactoNumero: string;
  animadores: string[];
  bailarines: string[];
  dj: string[];
  staffLucido: string[];
  staffApoyo: string[];
  muneco: string[];
  videoFotografia: string[];
  payaso: string[];
  showMagia: string[];
  totalEvento: string;
  movilidad: string;
  adelanto: string;
  saldo: string;
  pagoPersonal: string;
  ganancia: string;
  observacion: string;
}
