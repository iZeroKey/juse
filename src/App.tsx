import { useState, useCallback } from 'react';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import type { JuseEvent, CalendarView } from '@/types/event';
import { useEvents } from '@/hooks/use-events';
import { CalendarHeader } from '@/components/calendar/calendar-header';
import { WeekView } from '@/components/calendar/week-view';
import { MonthView } from '@/components/calendar/month-view';
import { EventSheet } from '@/components/event/event-sheet';
import { EventFormSheet } from '@/components/event/event-form-sheet';

export default function App() {
  const { addEvent, updateEvent, deleteEvent, getEvent } = useEvents();

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [view, setView] = useState<CalendarView>('week');
  const [selectedEvent, setSelectedEvent] = useState<JuseEvent | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<JuseEvent | undefined>(undefined);
  const [formInitialDate, setFormInitialDate] = useState<string | undefined>(undefined);

  const handleEventClick = useCallback((event: JuseEvent) => {
    setSelectedEvent(event);
    setDetailOpen(true);
  }, []);

  const handleDayClick = useCallback((date: Date) => {
    setCurrentDate(date);
  }, []);

  const handleNewEvent = useCallback((initialDate?: string) => {
    setEditingEvent(undefined);
    setFormInitialDate(initialDate);
    setFormOpen(true);
  }, []);

  const handleDeleteEvent = useCallback((id: string) => {
    deleteEvent(id);
    setDetailOpen(false);
    setSelectedEvent(null);
  }, [deleteEvent]);

  const handleFormSubmit = useCallback((data: Omit<JuseEvent, 'id' | 'duration' | 'saldo' | 'createdAt' | 'updatedAt'>) => {
    if (editingEvent) {
      updateEvent(editingEvent.id, data);
      // Refresh the selected event if viewing details
      const updated = getEvent(editingEvent.id);
      if (updated) setSelectedEvent(updated);
    } else {
      addEvent(data);
    }
    setFormOpen(false);
    setEditingEvent(undefined);
  }, [editingEvent, updateEvent, addEvent, getEvent]);

  const handleFormCancel = useCallback(() => {
    setFormOpen(false);
    setEditingEvent(undefined);
  }, []);

  return (
    <div className="flex flex-col h-dvh bg-background overflow-hidden">
      <CalendarHeader
        currentDate={currentDate}
        view={view}
        onViewChange={setView}
        onNavigate={setCurrentDate}
        onNewEvent={() => handleNewEvent(format(currentDate, 'yyyy-MM-dd'))}
      />

      <main className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {view === 'week' && (
            <motion.div
              key="week"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <WeekView
                date={currentDate}
                onEventClick={handleEventClick}
                onDayClick={handleDayClick}
              />
            </motion.div>
          )}

          {view === 'month' && (
            <motion.div
              key="month"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <MonthView
                date={currentDate}
                onEventClick={handleEventClick}
                onDayClick={handleDayClick}
                onNewEvent={handleNewEvent}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Event Detail Sheet */}
      <EventSheet
        event={selectedEvent}
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          // Small delay to allow sheet close animation
          setTimeout(() => setSelectedEvent(null), 300);
        }}
        onEdit={(event) => {
          setEditingEvent(event);
          setFormOpen(true);
        }}
        onDelete={handleDeleteEvent}
      >
        <EventFormSheet
          open={formOpen && !!editingEvent}
          onClose={handleFormCancel}
          initialData={editingEvent}
          initialDate={formInitialDate}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      </EventSheet>

      {/* Event Form Sheet (For New Events) */}
      {!editingEvent && (
        <EventFormSheet
          open={formOpen}
          onClose={handleFormCancel}
          initialDate={formInitialDate}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
}
