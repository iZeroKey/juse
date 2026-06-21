import { useState } from 'react';
import { Package, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PackagesTable } from './packages-table';
import { ContractsTable } from './contracts-table';
import { defaultPackages, defaultContracts } from '@/data/seed';
import { NavDrawer } from '@/components/layout/nav-drawer';

interface ContractsPageProps {
  appView: 'calendar' | 'contracts';
  onAppViewChange: (view: 'calendar' | 'contracts') => void;
}

export function ContractsPage({ appView, onAppViewChange }: ContractsPageProps) {
  const [activeTab, setActiveTab] = useState<'contracts' | 'packages'>('contracts');

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <header className="flex items-center gap-4 border-b border-border bg-surface px-4 py-3 shrink-0">
        <NavDrawer currentView={appView} onViewChange={onAppViewChange} />
        
        {/* Wordmark */}
        <h1 className="select-none font-display text-lg font-bold tracking-tight md:text-xl flex items-center shrink-0">
          <img src="/juse.png" alt="Juse Logo" className="h-6 md:h-8 object-contain" />
        </h1>
        
        <button
          onClick={() => {
            if (window.confirm('¿Borrar datos actuales y cargar los datos de prueba?')) {
              localStorage.setItem('juse-packages', JSON.stringify(defaultPackages));
              localStorage.setItem('juse-contracts', JSON.stringify(defaultContracts));
              window.location.reload();
            }
          }}
          className="ml-4 px-3 py-1.5 text-xs font-medium bg-amber-100 text-amber-800 rounded-md hover:bg-amber-200 transition-colors"
        >
          Cargar Datos Demo
        </button>

        {/* Tabs */}
        <div className="ml-auto flex items-center p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setActiveTab('contracts')}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
              activeTab === 'contracts' ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            )}
          >
            <FileText className="size-4" />
            Contratos
          </button>
          <button
            onClick={() => setActiveTab('packages')}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
              activeTab === 'packages' ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            )}
          >
            <Package className="size-4" />
            Paquetes
          </button>
        </div>
      </header>
      <main className="flex-1 overflow-auto p-4 md:p-6 bg-slate-50">
        {activeTab === 'contracts' ? <ContractsTable /> : <PackagesTable />}
      </main>
    </div>
  );
}
