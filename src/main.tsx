import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppToaster } from '@/components/app-toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { EventsProvider } from '@/context/events-context';
import { PackagesProvider } from '@/context/packages-context';
import { ContractsProvider } from '@/context/contracts-context';
import { HashRouter } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import App from './App';
import 'sileo/styles.css';
import './index.css';

if (typeof window !== 'undefined' && window.__TAURI_INTERNALS__) {
  document.addEventListener('contextmenu', e => e.preventDefault());
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PackagesProvider>
      <ContractsProvider>
        <EventsProvider>
          <TooltipProvider>
            <ThemeProvider defaultTheme="system" storageKey="juse-ui-theme">
              <HashRouter>
                <App />
              </HashRouter>
              <div className="[&_[data-sileo]]:!z-[99999]">
                <AppToaster />
              </div>
            </ThemeProvider>
          </TooltipProvider>
        </EventsProvider>
      </ContractsProvider>
    </PackagesProvider>
  </StrictMode>,
);
