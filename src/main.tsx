import { AppToaster } from "@/components/app-toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ContractsProvider } from "@/context/contracts-context";
import { EventsProvider } from "@/context/events-context";
import { PackagesProvider } from "@/context/packages-context";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import "sileo/styles.css";
import App from "./App";
import "./index.css";

if (typeof window !== "undefined" && "__TAURI_INTERNALS__" in window) {
  document.addEventListener("contextmenu", (e) => e.preventDefault());
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PackagesProvider>
      <ContractsProvider>
        <EventsProvider>
          <TooltipProvider>
            <ThemeProvider defaultTheme='system' storageKey='juse-ui-theme'>
              <HashRouter>
                <App />
              </HashRouter>
              <div className='**:data-sileo:z-99999!'>
                <AppToaster />
              </div>
            </ThemeProvider>
          </TooltipProvider>
        </EventsProvider>
      </ContractsProvider>
    </PackagesProvider>
  </StrictMode>,
);
