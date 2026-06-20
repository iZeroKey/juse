import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';
import {
  Drawer,
  DrawerPopup,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerPanel,
  DrawerFooter,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

import { EventForm } from '@/components/event/event-form';
import type { JuseEvent } from '@/types/event';

interface EventFormSheetProps {
  open: boolean;
  onClose: () => void;
  initialData?: JuseEvent;
  initialDate?: string;
  onSubmit: (data: Omit<JuseEvent, 'id' | 'duration' | 'saldo' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function EventFormSheet({ open, onClose, initialData, initialDate, onSubmit, onCancel }: EventFormSheetProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [activeTab, setActiveTab] = React.useState('general');

  // Reset tab when opening
  React.useEffect(() => {
    if (open) {
      setActiveTab('general');
    }
  }, [open]);
  return (
    <Drawer
      open={open}
      onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}
      position={isDesktop ? 'right' : 'bottom'}
    >
      <DrawerPopup variant="inset" showBar={!isDesktop} showCloseButton className="h-[85vh] sm:h-auto flex flex-col">
        <DrawerHeader className="pb-2 shrink-0">
          <DrawerTitle className="font-display text-xl">
            {initialData ? 'Editar Evento' : 'Nuevo Evento'}
          </DrawerTitle>
          <DrawerDescription>
            {initialData
              ? 'Modifica los datos del evento.'
              : 'Completa la información para crear un nuevo evento.'}
          </DrawerDescription>
          
          <div className="w-full grid grid-cols-3 bg-slate-100 p-1 rounded-lg mt-4">
            {[
              { id: 'general', label: 'General' },
              { id: 'staff', label: 'Staff' },
              { id: 'finanzas', label: 'Finanzas' },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'relative z-10 rounded-md py-1.5 px-3 text-sm font-medium transition-colors cursor-pointer',
                    isActive ? 'text-white' : 'text-slate-500 hover:text-slate-900'
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="eventFormTabsSheet"
                      className="absolute inset-0 rounded-md bg-accent"
                      style={{ zIndex: -1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  {tab.label}
                </button>
              );
            })}
          </div>
        </DrawerHeader>
        <DrawerPanel className="flex-1 overflow-y-auto min-h-0">
          <EventForm
            formId="event-form"
            activeTab={activeTab}
            initialData={initialData}
            initialDate={initialDate}
            onSubmit={onSubmit}
            onCancel={onCancel}
          />
        </DrawerPanel>
        <DrawerFooter variant="bare" className="shrink-0 pt-2 pb-6 px-6 mt-auto">
          <div className="flex items-center justify-end gap-3 w-full">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              form="event-form"
              className="bg-accent text-white hover:bg-accent-hover"
            >
              <Check className="w-4 h-4 mr-2" />
              {initialData ? 'Actualizar Evento' : 'Guardar Evento'}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerPopup>
    </Drawer>
  );
}

export default EventFormSheet;
