import {
  deleteEventFromDB,
  getEventsFromDB,
  insertEventToDB,
  updateEventInDB,
} from "@/lib/db";
import { calculateDuration, generateId } from "@/lib/utils";
import type { JuseEvent } from "@/types/event";
import React, { createContext, useCallback, useEffect, useState } from "react";

interface EventsContextValue {
  events: JuseEvent[];
  addEvent: (
    event: Omit<JuseEvent, "id" | "duration" | "createdAt" | "updatedAt">,
  ) => JuseEvent;
  updateEvent: (
    id: string,
    updates: Partial<JuseEvent>,
  ) => JuseEvent | undefined;
  deleteEvent: (id: string) => void;
  getEvent: (id: string) => JuseEvent | undefined;
  replaceEvents: (events: JuseEvent[]) => void;
  isLoaded: boolean;
}

export const EventsContext = createContext<EventsContextValue | null>(null);

function enrichEvent(
  event: Partial<JuseEvent> & {
    startTime: string;
    endTime: string;
    totalEvento: number;
    adelanto: number;
  },
): Pick<JuseEvent, "duration" | "saldo"> {
  return {
    duration: calculateDuration(event.startTime, event.endTime),
    saldo: event.totalEvento - event.adelanto,
  };
}

export function EventsProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<JuseEvent[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    getEventsFromDB()
      .then((data) => {
        setEvents(data);
        setIsLoaded(true);
      })
      .catch((err) => {
        console.error("Failed to load events from SQLite", err);
        setIsLoaded(true);
      });
  }, []);

  const addEvent = useCallback(
    (
      eventData: Omit<JuseEvent, "id" | "duration" | "createdAt" | "updatedAt">,
    ): JuseEvent => {
      const id = generateId();
      const duration = calculateDuration(
        eventData.startTime,
        eventData.endTime,
      );

      const newEvent: JuseEvent = {
        ...eventData,
        duration,
        id: id,
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
      };

      setEvents((prev) => [...prev, newEvent]);
      insertEventToDB(newEvent).catch(console.error);

      return newEvent;
    },
    [],
  );

  const updateEvent = useCallback(
    (id: string, updates: Partial<JuseEvent>): JuseEvent | undefined => {
      const existing = events.find((e) => e.id === id);
      if (!existing) return undefined;

      const merged = {
        ...existing,
        ...updates,
        updatedAt: new Date().toISOString().split("T")[0],
      };
      const computed = enrichEvent(merged as unknown as JuseEvent);
      const updatedEventMerged = { ...merged, ...computed };

      setEvents((prev) =>
        prev.map((e) => (e.id === id ? updatedEventMerged : e)),
      );

      updateEventInDB(id, updatedEventMerged).catch(console.error);

      return updatedEventMerged;
    },
    [events],
  );

  const deleteEvent = useCallback((id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    deleteEventFromDB(id).catch(console.error);
  }, []);

  const getEvent = useCallback(
    (id: string) => {
      return events.find((e) => e.id === id);
    },
    [events],
  );

  const replaceEvents = useCallback((newEvents: JuseEvent[]) => {
    setEvents(newEvents);
  }, []);

  return (
    <EventsContext.Provider
      value={{
        events,
        addEvent,
        updateEvent,
        deleteEvent,
        getEvent,
        replaceEvents,
        isLoaded,
      }}>
      {isLoaded ? children : null}
    </EventsContext.Provider>
  );
}
