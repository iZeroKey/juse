import React, { createContext, useCallback, useEffect, useState } from 'react';
import type { JuseEvent } from '@/types/event';
import { generateId, calculateDuration } from '@/lib/utils';

const STORAGE_KEY = 'juse-events';

interface EventsContextValue {
  events: JuseEvent[];
  addEvent: (event: Omit<JuseEvent, 'id' | 'duration' | 'createdAt' | 'updatedAt'>) => JuseEvent;
  updateEvent: (id: string, updates: Partial<JuseEvent>) => void;
  deleteEvent: (id: string) => void;
  getEvent: (id: string) => JuseEvent | undefined;
  replaceEvents: (events: JuseEvent[]) => void;
}

export const EventsContext = createContext<EventsContextValue | null>(null);

function loadEvents(): JuseEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as JuseEvent[];
  } catch {
    return [];
  }
}

function saveEvents(events: JuseEvent[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

function enrichEvent(event: Partial<JuseEvent> & { startTime: string; endTime: string; totalEvento: number; adelanto: number }): Pick<JuseEvent, 'duration' | 'saldo'> {
  return {
    duration: calculateDuration(event.startTime, event.endTime),
    saldo: event.totalEvento - event.adelanto,
  };
}

export function EventsProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<JuseEvent[]>(loadEvents);

  useEffect(() => {
    saveEvents(events);
  }, [events]);

  const addEvent = useCallback((eventData: Omit<JuseEvent, 'id' | 'duration' | 'createdAt' | 'updatedAt'>): JuseEvent => {
    const id = generateId();
    const duration = calculateDuration(eventData.startTime, eventData.endTime);
    // saldo is now provided by the form
    
    const newEvent: JuseEvent = {
      ...eventData,
      duration,
      id: id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEvents((prev) => [...prev, newEvent]);
    return newEvent;
  }, []);

  const updateEvent = useCallback((id: string, updates: Partial<JuseEvent>) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        const merged = { ...e, ...updates, updatedAt: new Date().toISOString() };
        const computed = enrichEvent(merged);
        return { ...merged, ...computed };
      })
    );
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const getEvent = useCallback((id: string) => {
    return events.find((e) => e.id === id);
  }, [events]);

  const replaceEvents = useCallback((newEvents: JuseEvent[]) => {
    setEvents(newEvents);
  }, []);

  return (
    <EventsContext.Provider value={{ events, addEvent, updateEvent, deleteEvent, getEvent, replaceEvents }}>
      {children}
    </EventsContext.Provider>
  );
}
