import { useState } from 'react';
import { Package, FileText, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { PackagesTable } from './packages-table';
import { ContractsTable } from './contracts-table';
import { NavDrawer } from '@/components/layout/nav-drawer';

export function ContractsPage() {
  const [activeTab, setActiveTab] = useState<'contracts' | 'packages'>('contracts');

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <header className="flex items-center gap-4 border-b border-border bg-surface px-4 py-3 shrink-0">
        {/* Navigation Drawer wrapping the Menu Icon */}
        <NavDrawer>
          <button
            type="button"
            className="p-1.5 md:p-2 rounded-md hover:bg-slate-100 transition-colors text-slate-600 cursor-pointer flex items-center justify-center shrink-0 mr-1"
            aria-label="Abrir menú"
          >
            <Menu className="size-5 md:size-5" />
          </button>
        </NavDrawer>

        <div className="select-none font-display text-lg font-bold tracking-tight flex items-center shrink-0">
          <img src="/juse.png" alt="Juse Logo" className="h-6 md:h-7 object-contain" />
        </div>

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
      <main className="flex-1 overflow-hidden bg-slate-50 relative p-4 md:p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'contracts' ? (
            <motion.div
              key="contracts"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-4 md:inset-6"
            >
              <ContractsTable />
            </motion.div>
          ) : (
            <motion.div
              key="packages"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-4 md:inset-6"
            >
              <PackagesTable />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
