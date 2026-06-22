import { useEvents } from "@/hooks/use-events";
import type { CalendarView, JuseEvent } from "@/types/event";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { sileo } from "sileo";

import { MonthView } from "@/components/calendar/month-view";
import { WeekView } from "@/components/calendar/week-view";
import { ContractsPage } from "@/components/contracts-page/contracts-page";
import { EventFormSheet } from "@/components/event/event-form-sheet";
import { EventSheet } from "@/components/event/event-sheet";
import { GlobalContextMenu } from "@/components/global-context-menu";
import { NavDrawer } from "@/components/layout/nav-drawer";
import { TitleBar } from "@/components/title-bar";
import { formatDateHeader } from "@/lib/calendar-utils";
import { cn } from "@/lib/utils";
import { addMonths, addWeeks, isToday } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Menu,
  Package,
  Plus,
} from "lucide-react";

const VIEWS: { value: CalendarView; label: string; short: string }[] = [
  { value: "week", label: "Semana", short: "S" },
  { value: "month", label: "Mes", short: "M" },
];

export default function App() {
  const { addEvent, updateEvent, deleteEvent, getEvent } = useEvents();
  const location = useLocation();

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [view, setView] = useState<CalendarView>("month");
  const [selectedEvent, setSelectedEvent] = useState<JuseEvent | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<JuseEvent | undefined>(
    undefined,
  );
  const [formInitialDate, setFormInitialDate] = useState<string | undefined>(
    undefined,
  );
  const [contractsActiveTab, setContractsActiveTab] = useState<
    "contracts" | "packages"
  >("contracts");

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

  const handleDeleteEvent = useCallback(
    (id: string) => {
      deleteEvent(id);
      setDetailOpen(false);
      setSelectedEvent(null);
      sileo.success({
        title: "Evento eliminado",
        description: `El evento "${selectedEvent?.eventType || ""}" ha sido eliminado exitosamente`,
      });
    },
    [deleteEvent, selectedEvent],
  );

  const handleFormSubmit = useCallback(
    (data: Omit<JuseEvent, "id" | "duration" | "createdAt" | "updatedAt">) => {
      if (editingEvent) {
        updateEvent(editingEvent.id, data);
        const updated = getEvent(editingEvent.id);
        if (updated) setSelectedEvent(updated);
        sileo.success({
          title: "Evento actualizado",
          description: `Los cambios para el evento "${data.eventType}" han sido guardados`,
        });
      } else {
        addEvent(data);
        sileo.success({
          title: "Evento creado",
          description: `El evento "${data.eventType}" ha sido registrado exitosamente`,
        });
      }
      setFormOpen(false);
      setEditingEvent(undefined);
    },
    [editingEvent, updateEvent, addEvent, getEvent],
  );

  const handleFormCancel = useCallback(() => {
    setFormOpen(false);
    setEditingEvent(undefined);
  }, []);

  const navigateDate = (
    date: Date,
    viewType: CalendarView,
    direction: 1 | -1,
  ): Date => {
    return viewType === "week"
      ? addWeeks(date, direction)
      : addMonths(date, direction);
  };

  const handlePrev = useCallback(
    () => setCurrentDate((d) => navigateDate(d, view, -1)),
    [view],
  );
  const handleNext = useCallback(
    () => setCurrentDate((d) => navigateDate(d, view, 1)),
    [view],
  );
  const handleToday = useCallback(() => setCurrentDate(new Date()), []);

  const dateLabel = formatDateHeader(currentDate, view);
  const isCurrentDateToday = isToday(currentDate);

  return (
    <GlobalContextMenu>
      <div className='flex flex-col h-dvh bg-background overflow-hidden relative'>
        <TitleBar />

        <header className='flex items-center justify-between gap-2 border-b border-border bg-surface px-3 py-2 md:px-5 md:py-3 shrink-0'>
          <div className='flex items-center gap-2 md:gap-3 flex-1 min-w-0'>
            <NavDrawer>
              <button
                type='button'
                className='p-1.5 md:p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground cursor-pointer flex items-center justify-center shrink-0 mr-1'
                aria-label='Abrir menú'>
                <Menu className='size-5 md:size-5' />
              </button>
            </NavDrawer>

            <div className='select-none font-display text-lg font-bold tracking-tight flex items-center shrink-0'>
              <img
                src='/juse.png'
                alt='Juse Show Logo'
                className='h-6 md:h-7 object-contain'
              />
            </div>

            <div
              className='mx-0.5 h-5 w-px bg-border-strong md:mx-1 shrink-0'
              aria-hidden='true'
            />

            <AnimatePresence mode='popLayout'>
              {location.pathname === "/" && (
                <motion.div
                  key='calendar-left'
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className='flex items-center gap-2 md:gap-3 shrink-0 overflow-hidden'>
                  <div className='flex items-center rounded-full border border-border bg-surface shadow-sm overflow-hidden h-7 md:h-8 shrink-0'>
                    <button
                      onClick={handlePrev}
                      className='flex items-center justify-center h-full w-8 md:w-9 border-r border-border bg-transparent hover:bg-muted/50 active:bg-muted transition-colors cursor-pointer'>
                      <ChevronLeft className='size-3.5 md:size-4 text-muted-foreground' />
                    </button>
                    <button
                      onClick={handleToday}
                      className={cn(
                        "flex items-center justify-center h-full px-3 md:px-4 text-xs md:text-[13px] font-semibold transition-colors border-r border-border cursor-pointer",
                        isCurrentDateToday
                          ? "text-(--color-juse-blue) bg-(--color-juse-blue)/5 hover:bg-(--color-juse-blue)/10"
                          : "text-muted-foreground bg-transparent hover:bg-muted/50 hover:text-foreground",
                      )}>
                      Hoy
                      <span
                        className={cn(
                          "ml-1 md:ml-1.5 size-1.5 rounded-full transition-colors",
                          isCurrentDateToday
                            ? "bg-(--color-juse-blue)"
                            : "bg-muted-foreground/30",
                        )}
                      />
                    </button>
                    <button
                      onClick={handleNext}
                      className='flex items-center justify-center h-full w-8 md:w-9 bg-transparent hover:bg-muted/50 active:bg-muted transition-colors cursor-pointer'>
                      <ChevronRight className='size-3.5 md:size-4 text-muted-foreground' />
                    </button>
                  </div>
                  <span className='truncate text-sm font-medium capitalize text-text-secondary block'>
                    {dateLabel}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className='flex items-center gap-2 md:gap-3 shrink-0'>
            <AnimatePresence mode='popLayout'>
              {location.pathname === "/" ? (
                <motion.div
                  key='calendar-right'
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className='flex items-center gap-2 md:gap-3 shrink-0'>
                  <div className='flex items-center rounded-lg bg-muted p-1'>
                    {VIEWS.map((v) => {
                      const isActive = view === v.value;
                      return (
                        <button
                          key={v.value}
                          type='button'
                          onClick={() => setView(v.value)}
                          className={cn(
                            "relative z-10 rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer md:px-3 md:py-1.5 md:text-sm",
                            isActive
                              ? "text-white"
                              : "text-text-secondary hover:text-text-primary",
                          )}>
                          {isActive && (
                            <motion.span
                              layoutId='calendarViewSwitcher'
                              className='absolute inset-0 rounded-md bg-(--color-juse-blue)'
                              style={{ zIndex: -1 }}
                              transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 30,
                              }}
                            />
                          )}
                          <span className='hidden md:inline'>{v.label}</span>
                          <span className='md:hidden'>{v.short}</span>
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type='button'
                    onClick={() =>
                      handleNewEvent(format(currentDate, "yyyy-MM-dd"))
                    }
                    className='inline-flex items-center justify-center gap-2 font-medium text-white cursor-pointer bg-(--color-juse-red) hover:brightness-110 transition-all shadow-sm hover:shadow-md size-9 rounded-full text-sm md:h-9 md:w-auto md:rounded-full md:px-4'>
                    <Plus className='size-4 shrink-0' />
                    <span className='hidden md:inline'>Nuevo Evento</span>
                  </button>
                </motion.div>
              ) : location.pathname === "/gestion" ? (
                <motion.div
                  key='contracts-right'
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className='ml-auto flex items-center p-1 bg-muted rounded-lg'>
                  <button
                    onClick={() => setContractsActiveTab("contracts")}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer",
                      contractsActiveTab === "contracts"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}>
                    <FileText className='size-4' />
                    Contratos
                  </button>
                  <button
                    onClick={() => setContractsActiveTab("packages")}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer",
                      contractsActiveTab === "packages"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}>
                    <Package className='size-4' />
                    Paquetes
                  </button>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </header>

        <AnimatePresence mode='wait'>
          <Routes location={location} key={location.pathname}>
            <Route
              path='/gestion'
              element={
                <motion.div
                  key='contracts'
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className='flex-1 w-full relative z-0 bg-background flex flex-col min-h-0'>
                  <ContractsPage activeTab={contractsActiveTab} />
                </motion.div>
              }
            />

            <Route
              path='/'
              element={
                <motion.div
                  key='calendar'
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className='flex-1 w-full relative z-0 bg-background flex flex-col min-h-0'>
                  <main className='flex-1 overflow-hidden relative'>
                    <AnimatePresence mode='wait'>
                      {view === "week" && (
                        <motion.div
                          key='week'
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.2 }}
                          className='absolute inset-0'>
                          <WeekView
                            date={currentDate}
                            onEventClick={handleEventClick}
                            onDayClick={handleDayClick}
                            onEditEvent={(event) => {
                              setEditingEvent(event);
                              setFormOpen(true);
                            }}
                            onDeleteEvent={handleDeleteEvent}
                          />
                        </motion.div>
                      )}

                      {view === "month" && (
                        <motion.div
                          key='month'
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.2 }}
                          className='absolute inset-0'>
                          <MonthView
                            date={currentDate}
                            onEventClick={handleEventClick}
                            onDayClick={handleDayClick}
                            onNewEvent={handleNewEvent}
                            onEditEvent={(event) => {
                              setEditingEvent(event);
                              setFormOpen(true);
                            }}
                            onDeleteEvent={handleDeleteEvent}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </main>
                </motion.div>
              }
            />
          </Routes>
        </AnimatePresence>

        <EventSheet
          event={selectedEvent}
          open={detailOpen}
          onClose={() => {
            setDetailOpen(false);
            setTimeout(() => setSelectedEvent(null), 300);
          }}
          onEdit={(event) => {
            setEditingEvent(event);
            setFormOpen(true);
          }}
          onDelete={handleDeleteEvent}>
          <EventFormSheet
            open={formOpen && !!editingEvent}
            onClose={handleFormCancel}
            initialData={editingEvent}
            initialDate={formInitialDate}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        </EventSheet>

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
    </GlobalContextMenu>
  );
}
