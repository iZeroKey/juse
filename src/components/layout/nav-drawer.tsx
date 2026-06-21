import { Menu, Calendar, FileText, X, FolderOpen, Moon } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '@/components/theme-provider';
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
  const { theme, setTheme } = useTheme();
  const currentView = location.pathname === '/gestion' ? 'contracts' : 'calendar';

  const handleNavigation = (path: string) => {
    // Delay view change to allow sheet close animation to complete
    setTimeout(() => {
      navigate(path);
    }, 300);
  };

  const handleThemeChange = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
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
            className="flex items-center justify-center size-9 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors cursor-pointer"
            aria-label="Menú principal"
          >
            <Menu className="size-5" />
          </button>
        )}
      </SheetTrigger>
      
      <SheetContent side="left" className="w-[280px] p-0 flex flex-col" showCloseButton={false}>
        <SheetHeader className="flex flex-row items-center justify-between p-4 border-b border-border text-left">
          <SheetTitle className="text-lg">Menú</SheetTitle>
          <SheetClose className="flex items-center justify-center size-8 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground cursor-pointer">
            <X className="size-5" />
            <span className="sr-only">Cerrar menú</span>
          </SheetClose>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto py-4 px-2 flex flex-col gap-1">
          <SheetClose asChild>
            <button 
              onClick={() => handleNavigation('/')}
              className={`flex items-center w-full text-left py-2.5 px-3 rounded-md transition-colors cursor-pointer ${currentView === 'calendar' ? 'bg-muted font-medium text-[var(--color-juse-blue)]' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
            >
              <Calendar className="size-5 mr-3" />
              Calendario
            </button>
          </SheetClose>
          
          <SheetClose asChild>
            <button 
              onClick={() => handleNavigation('/gestion')}
              className={`flex items-center w-full text-left py-2.5 px-3 rounded-md transition-colors cursor-pointer ${currentView === 'contracts' ? 'bg-muted font-medium text-[var(--color-juse-blue)]' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
            >
              <FileText className="size-5 mr-3" />
              Gestión
            </button>
          </SheetClose>
        </div>

        {/* ── Settings Section ─────────────────────────────── */}
        <div className="p-4 border-t border-border bg-muted/50">
          <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Ajustes</p>
          <div className="flex flex-col gap-1">
            <button 
              onClick={handleThemeChange}
              className="flex items-center w-full text-left py-2.5 px-3 rounded-md transition-colors text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
            >
              <Moon className="size-5 mr-3" />
              Cambiar Tema
            </button>
            <button 
              onClick={handleDownloadPath}
              className="flex items-center w-full text-left py-2.5 px-3 rounded-md transition-colors text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
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
