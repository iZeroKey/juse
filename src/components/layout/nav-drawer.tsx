import { Menu, Calendar, FileText, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';

interface NavDrawerProps {
  currentView: 'calendar' | 'contracts';
  onViewChange: (view: 'calendar' | 'contracts') => void;
}

export function NavDrawer({ currentView, onViewChange }: NavDrawerProps) {
  const handleNavigation = (view: 'calendar' | 'contracts') => {
    // Delay view change to allow sheet close animation to complete
    setTimeout(() => {
      onViewChange(view);
    }, 300);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          className="flex items-center justify-center size-9 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
          aria-label="Menú principal"
        >
          <Menu className="size-5" />
        </button>
      </SheetTrigger>
      
      <SheetContent side="left" className="w-[280px] p-0 flex flex-col" showCloseButton={false}>
        <SheetHeader className="flex flex-row items-center justify-between p-4 border-b border-border text-left">
          <SheetTitle className="text-lg">Menú</SheetTitle>
          <SheetClose className="flex items-center justify-center size-8 rounded-full hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-900">
            <X className="size-5" />
            <span className="sr-only">Cerrar menú</span>
          </SheetClose>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto py-4 px-2 flex flex-col gap-1">
          <SheetClose asChild>
            <button 
              onClick={() => handleNavigation('calendar')}
              className={`flex items-center w-full text-left py-2.5 px-3 rounded-md transition-colors ${currentView === 'calendar' ? 'bg-slate-100 font-medium text-[var(--color-juse-blue)]' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <Calendar className="size-5 mr-3" />
              Calendario
            </button>
          </SheetClose>
          
          <SheetClose asChild>
            <button 
              onClick={() => handleNavigation('contracts')}
              className={`flex items-center w-full text-left py-2.5 px-3 rounded-md transition-colors ${currentView === 'contracts' ? 'bg-slate-100 font-medium text-[var(--color-juse-blue)]' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <FileText className="size-5 mr-3" />
              Gestión
            </button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}
