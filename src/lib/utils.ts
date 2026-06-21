import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function formatCurrency(value: number): string {
  return `S/ ${value.toFixed(2)}`;
}

export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

export function calculateDuration(startTime: string, endTime: string): number {
  if (!startTime || !endTime) return 0;
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  const diff = endMinutes - startMinutes;
  return diff > 0 ? diff : diff + 24 * 60; // handle crossing midnight
}

export function formatDuration(minutes: number): string {
  if (minutes <= 0) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

export function formatFecha(isoString?: string) {
  if (!isoString) return "";
  const partes = isoString.split('T')[0].split('-');
  if (partes.length !== 3) return isoString;
  const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  return `${parseInt(partes[2])} de ${meses[parseInt(partes[1]) - 1]} de ${partes[0]}`;
}

export function formatHora(horaString?: string) {
  if (!horaString) return "";
  const partes = horaString.split(':');
  if (partes.length < 2) return horaString;
  let h = parseInt(partes[0]);
  const m = partes[1];
  const ampm = h >= 12 ? 'p. m.' : 'a. m.';
  h = h % 12;
  h = h ? h : 12;
  const hStr = h < 10 ? `0${h}` : h.toString();
  return `${hStr}:${m} ${ampm}`;
}