import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addDays,
  isSameDay,
  format,
  parse,
  getDay,
} from 'date-fns';
import { es } from 'date-fns/locale';
import type { JuseEvent } from '@/types/event';

export { es };

export function getWeekDays(date: Date): Date[] {
  const start = startOfWeek(date, { weekStartsOn: 1 }); // Monday
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function getMonthGrid(date: Date): Date[][] {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

export function getEventsForDate(events: JuseEvent[], date: Date): JuseEvent[] {
  const dateStr = format(date, 'yyyy-MM-dd');
  return events
    .filter((e) => e.date === dateStr)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
}

export function getEventsForWeek(events: JuseEvent[], date: Date): JuseEvent[] {
  const days = getWeekDays(date);
  const startStr = format(days[0], 'yyyy-MM-dd');
  const endStr = format(days[6], 'yyyy-MM-dd');
  return events
    .filter((e) => e.date >= startStr && e.date <= endStr)
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
}

export function getEventsForMonth(events: JuseEvent[], date: Date): JuseEvent[] {
  const monthStart = format(startOfMonth(date), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(date), 'yyyy-MM-dd');
  return events
    .filter((e) => e.date >= monthStart && e.date <= monthEnd)
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
}

// --- Overlap calculation for time-grid views ---

export interface PositionedEvent {
  event: JuseEvent;
  column: number;
  totalColumns: number;
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function calculateOverlaps(events: JuseEvent[]): PositionedEvent[] {
  if (events.length === 0) return [];

  const sorted = [...events].sort((a, b) => {
    const diff = timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
    return diff !== 0 ? diff : timeToMinutes(a.endTime) - timeToMinutes(b.endTime);
  });

  // Group overlapping events into clusters
  const clusters: JuseEvent[][] = [];
  let currentCluster: JuseEvent[] = [sorted[0]];
  let clusterEnd = timeToMinutes(sorted[0].endTime);

  for (let i = 1; i < sorted.length; i++) {
    const eventStart = timeToMinutes(sorted[i].startTime);
    if (eventStart < clusterEnd) {
      currentCluster.push(sorted[i]);
      clusterEnd = Math.max(clusterEnd, timeToMinutes(sorted[i].endTime));
    } else {
      clusters.push(currentCluster);
      currentCluster = [sorted[i]];
      clusterEnd = timeToMinutes(sorted[i].endTime);
    }
  }
  clusters.push(currentCluster);

  // Assign columns within each cluster using greedy algorithm
  const result: PositionedEvent[] = [];

  for (const cluster of clusters) {
    const columns: JuseEvent[][] = [];

    for (const event of cluster) {
      const eventStart = timeToMinutes(event.startTime);
      let placed = false;

      for (let col = 0; col < columns.length; col++) {
        const lastInCol = columns[col][columns[col].length - 1];
        if (timeToMinutes(lastInCol.endTime) <= eventStart) {
          columns[col].push(event);
          placed = true;
          break;
        }
      }

      if (!placed) {
        columns.push([event]);
      }
    }

    const totalColumns = columns.length;
    for (let col = 0; col < columns.length; col++) {
      for (const event of columns[col]) {
        result.push({ event, column: col, totalColumns });
      }
    }
  }

  return result;
}

export function getEventTopPercent(startTime: string, gridStartHour: number = 0): number {
  const minutes = timeToMinutes(startTime);
  const gridStartMinutes = gridStartHour * 60;
  return ((minutes - gridStartMinutes) / ((24 - gridStartHour) * 60)) * 100;
}

export function getEventHeightPercent(startTime: string, endTime: string, gridStartHour: number = 0): number {
  const startMin = timeToMinutes(startTime);
  const endMin = timeToMinutes(endTime);
  const duration = endMin > startMin ? endMin - startMin : endMin + 24 * 60 - startMin;
  return (duration / ((24 - gridStartHour) * 60)) * 100;
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

export function formatDateHeader(date: Date, view: 'day' | 'week' | 'month'): string {
  switch (view) {
    case 'day':
      return format(date, "EEEE d 'de' MMMM, yyyy", { locale: es });
    case 'week': {
      const days = getWeekDays(date);
      const start = format(days[0], 'd MMM', { locale: es });
      const end = format(days[6], "d MMM ''yy", { locale: es });
      return `${start} — ${end}`;
    }
    case 'month':
      return format(date, "MMMM yyyy", { locale: es });
  }
}

export function parseTimeToDate(dateStr: string, timeStr: string): Date {
  return parse(`${dateStr} ${timeStr}`, 'yyyy-MM-dd HH:mm', new Date());
}

export function getDayOfWeekName(date: Date): string {
  return format(date, 'EEE', { locale: es });
}

export function getDayNumber(date: Date): number {
  return parseInt(format(date, 'd'), 10);
}

// Helper to get a color for event types
const EVENT_TYPE_COLORS: Record<string, string> = {
  'Gincana': 'bg-violet-500/15 border-violet-500/30 text-violet-800',
  'Revelación de Género': 'bg-pink-500/15 border-pink-500/30 text-pink-800',
  'Baby Shower': 'bg-sky-500/15 border-sky-500/30 text-sky-800',
  'Cumpleaños': 'bg-amber-500/15 border-amber-500/30 text-amber-800',
  'Boda': 'bg-rose-500/15 border-rose-500/30 text-rose-800',
  'Corporativo': 'bg-slate-500/15 border-slate-500/30 text-slate-800',
  'Personalizado': 'bg-teal-500/15 border-teal-500/30 text-teal-800',
};

export function getEventTypeColor(eventType: string): string {
  return EVENT_TYPE_COLORS[eventType] ?? 'bg-indigo-100 border-indigo-300 text-indigo-800';
}

const EVENT_TYPE_DOT_COLORS: Record<string, string> = {
  'Gincana': 'bg-violet-500',
  'Revelación de Género': 'bg-pink-500',
  'Baby Shower': 'bg-sky-500',
  'Cumpleaños': 'bg-amber-500',
  'Boda': 'bg-rose-500',
  'Corporativo': 'bg-slate-500',
  'Personalizado': 'bg-teal-500',
};

export function getEventTypeDotColor(eventType: string): string {
  return EVENT_TYPE_DOT_COLORS[eventType] ?? 'bg-indigo-500';
}

export interface TimeBlock {
  startHour: number;
  endHour: number;
}

export function computeTimeBlocks(events: JuseEvent[]): TimeBlock[] {
  if (events.length === 0) {
    return [{ startHour: 8, endHour: 18 }]; // Default 8am to 6pm
  }

  // Extract intervals in minutes
  const intervals = events.map(e => {
    const startMin = timeToMinutes(e.startTime);
    const endMin = timeToMinutes(e.endTime);
    // Add ±1 hour (60 mins) buffer
    return [startMin - 60, endMin + 60];
  });

  // Sort intervals by start time
  intervals.sort((a, b) => a[0] - b[0]);

  // Merge overlapping intervals
  const merged: number[][] = [intervals[0]];
  for (let i = 1; i < intervals.length; i++) {
    const current = intervals[i];
    const last = merged[merged.length - 1];

    if (current[0] <= last[1]) {
      // Overlap, update the end time of the last interval
      last[1] = Math.max(last[1], current[1]);
    } else {
      // No overlap, add as a new interval
      merged.push(current);
    }
  }

  // Convert back to hours, clamping between 0 and 24
  return merged.map(interval => {
    const startHour = Math.max(0, Math.floor(interval[0] / 60));
    const endHour = Math.min(24, Math.ceil(interval[1] / 60));
    return { startHour, endHour };
  });
}

export { format, isSameDay, getDay, addDays, parse };
