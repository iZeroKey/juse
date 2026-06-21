import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { EventsProvider } from '@/context/events-context';
import { PackagesProvider } from '@/context/packages-context';
import { ContractsProvider } from '@/context/contracts-context';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PackagesProvider>
      <ContractsProvider>
        <EventsProvider>
          <TooltipProvider>
            <App />
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  fontFamily: 'Inter, system-ui, sans-serif',
                },
              }}
            />
          </TooltipProvider>
        </EventsProvider>
      </ContractsProvider>
    </PackagesProvider>
  </StrictMode>,
);
