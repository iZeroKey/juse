import { useState, useCallback } from 'react';
import { format } from 'date-fns';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { sileo } from 'sileo';
import type { JuseEvent, CalendarView } from '@/types/event';
import { useEvents } from '@/hooks/use-events';
import { CalendarHeader } from '@/components/calendar/calendar-header';
import { WeekView } from '@/components/calendar/week-view';
import { MonthView } from '@/components/calendar/month-view';
import { EventSheet } from '@/components/event/event-sheet';
import { EventFormSheet } from '@/components/event/event-form-sheet';
import { ContractsPage } from '@/components/contracts-page/contracts-page';

import { TitleBar } from '@/components/title-bar';

export default function App() {
  const { addEvent, updateEvent, deleteEvent, getEvent } = useEvents();
  const location = useLocation();

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [view, setView] = useState<CalendarView>('month');
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
    sileo.success({ title: 'Evento eliminado', description: `El evento "${selectedEvent?.eventType || ''}" ha sido eliminado exitosamente` });
  }, [deleteEvent, selectedEvent]);

  const handleFormSubmit = useCallback((data: Omit<JuseEvent, 'id' | 'duration' | 'createdAt' | 'updatedAt'>) => {
    if (editingEvent) {
      updateEvent(editingEvent.id, data);
      const updated = getEvent(editingEvent.id);
      if (updated) setSelectedEvent(updated);
      sileo.success({ title: 'Evento actualizado', description: `Los cambios para el evento "${data.eventType}" han sido guardados` });
    } else {
      addEvent(data);
      sileo.success({ title: 'Evento creado', description: `El evento "${data.eventType}" ha sido registrado exitosamente` });
    }
    setFormOpen(false);
    setEditingEvent(undefined);
  }, [editingEvent, updateEvent, addEvent, getEvent]);

  const handleFormCancel = useCallback(() => {
    setFormOpen(false);
    setEditingEvent(undefined);
  }, []);

  return (
    <div className="flex flex-col h-dvh bg-background overflow-hidden relative">
      <TitleBar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/gestion" element={
            <motion.div
              key="contracts"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex-1 w-full relative z-0 bg-background flex flex-col min-h-0"
            >
              <ContractsPage />
            </motion.div>
          } />
          
          <Route path="/" element={
            <motion.div
              key="calendar"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex-1 w-full relative z-0 bg-background flex flex-col min-h-0"
            >
              <CalendarHeader
                currentDate={currentDate}
                view={view}
                onViewChange={setView}
                onNavigate={setCurrentDate}
                onNewEvent={() => handleNewEvent(format(currentDate, 'yyyy-MM-dd'))}
              />

              <main className="flex-1 overflow-hidden relative">
                <AnimatePresence mode="wait">
                  {view === 'week' && (
                    <motion.div
                      key="week"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                      className="absolute inset-0"
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
                      className="absolute inset-0"
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
            </motion.div>
          } />
        </Routes>
      </AnimatePresence>

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
