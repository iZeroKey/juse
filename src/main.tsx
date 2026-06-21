import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sileo';
import { TooltipProvider } from '@/components/ui/tooltip';
import { EventsProvider } from '@/context/events-context';
import { PackagesProvider } from '@/context/packages-context';
import { ContractsProvider } from '@/context/contracts-context';
import { HashRouter } from 'react-router-dom';
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
            <HashRouter>
              <App />
            </HashRouter>
            <div className="[&_[data-sileo]]:!z-[99999]">
              <Toaster 
                theme="dark" 
                position="top-right" 
                offset={{ top: 48, right: 16 }} 
                options={{
                  fill: "#171717",
                  styles: {
                    title: "text-white!",
                    description: "text-white/75!",
                    badge: "bg-white/10!",
                    button: "bg-white/10! hover:bg-white/15!",
                  }
                }}
              />
            </div>
          </TooltipProvider>
        </EventsProvider>
      </ContractsProvider>
    </PackagesProvider>
  </StrictMode>,
);
