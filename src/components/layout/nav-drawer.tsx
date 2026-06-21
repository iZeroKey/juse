import { Menu, Calendar, FileText, X, FolderOpen, Moon } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';

interface NavDrawerProps {
  children?: React.ReactNode;
}

export function NavDrawer({ children }: NavDrawerProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentView = location.pathname === '/gestion' ? 'contracts' : 'calendar';

  const handleNavigation = (path: string) => {
    // Delay view change to allow sheet close animation to complete
    setTimeout(() => {
      navigate(path);
    }, 300);
  };

  const handleThemeChange = () => {
    console.log("Cambio de tema en desarrollo");
  };

  const handleDownloadPath = async () => {
    if (typeof window !== 'undefined' && window.__TAURI_INTERNALS__) {
      try {
        const { open } = await import('@tauri-apps/plugin-dialog');
        const selected = await open({
          directory: true,
          multiple: false,
          title: "Selecciona la carpeta de descargas"
        });
        if (selected && typeof selected === 'string') {
          localStorage.setItem('downloadPath', selected);
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      alert("La configuración de descargas solo funciona en la app de escritorio.");
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children ? (
          children
        ) : (
          <button
            type="button"
            className="flex items-center justify-center size-9 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
            aria-label="Menú principal"
          >
            <Menu className="size-5" />
          </button>
        )}
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
              onClick={() => handleNavigation('/')}
              className={`flex items-center w-full text-left py-2.5 px-3 rounded-md transition-colors ${currentView === 'calendar' ? 'bg-slate-100 font-medium text-[var(--color-juse-blue)]' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <Calendar className="size-5 mr-3" />
              Calendario
            </button>
          </SheetClose>
          
          <SheetClose asChild>
            <button 
              onClick={() => handleNavigation('/gestion')}
              className={`flex items-center w-full text-left py-2.5 px-3 rounded-md transition-colors ${currentView === 'contracts' ? 'bg-slate-100 font-medium text-[var(--color-juse-blue)]' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <FileText className="size-5 mr-3" />
              Gestión
            </button>
          </SheetClose>
        </div>

        {/* ── Settings Section ─────────────────────────────── */}
        <div className="p-4 border-t border-border bg-slate-50/50">
          <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Ajustes</p>
          <div className="flex flex-col gap-1">
            <button 
              onClick={handleThemeChange}
              className="flex items-center w-full text-left py-2.5 px-3 rounded-md transition-colors text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              <Moon className="size-5 mr-3" />
              Cambiar Tema
            </button>
            <button 
              onClick={handleDownloadPath}
              className="flex items-center w-full text-left py-2.5 px-3 rounded-md transition-colors text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              <FolderOpen className="size-5 mr-3" />
              Ruta de Descarga
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
