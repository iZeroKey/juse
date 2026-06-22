import React, { useState } from 'react';
import { Download, Upload, Database, FileText, Package, PartyPopper } from 'lucide-react';
import { sileo } from 'sileo';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { exportDataToJSON, parseImportFile, executeImport, type ExportData, type TableName } from '@/lib/data-management';

const TABLE_NAMES_ES: Record<TableName, string> = {
  contracts: 'Contratos',
  packages: 'Paquetes',
  events: 'Eventos'
};

interface DataManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DataManagementModal({ open, onOpenChange }: DataManagementModalProps) {
  const [view, setView] = useState<'main' | 'export' | 'import-confirm'>('main');
  const [importPayload, setImportPayload] = useState<ExportData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Reset view when opening
  React.useEffect(() => {
    if (open) setView('main');
  }, [open]);

  const handleExport = async (table: TableName) => {
    setIsProcessing(true);
    const result = await exportDataToJSON(table);
    setIsProcessing(false);
    if (result.success && result.path) {
      sileo.success({ 
        title: 'Exportación exitosa', 
        description: `Los datos se han guardado correctamente.`
      });
      onOpenChange(false);
    }
  };

  const handleImportStart = async () => {
    setIsProcessing(true);
    const result = await parseImportFile();
    setIsProcessing(false);
    
    if (result.success && result.payload) {
      setImportPayload(result.payload);
      setView('import-confirm');
    } else if (result.message && result.message !== 'Operación cancelada.') {
      sileo.error({ title: 'Error al importar', description: result.message });
    }
  };

  const handleImportConfirm = async (mode: 'replace' | 'append') => {
    if (!importPayload) return;
    
    setIsProcessing(true);
    const result = await executeImport(importPayload, mode);
    setIsProcessing(false);
    
    if (result.success) {
      sileo.success({ title: 'Importación exitosa', description: result.message });
      onOpenChange(false);
      // Reload page to reflect new DB data after a short delay
      setTimeout(() => window.location.reload(), 1500);
    } else {
      sileo.error({ title: 'Error', description: result.message });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gestión de Datos</DialogTitle>
          <DialogDescription>
            Importa o exporta información de la base de datos local.
          </DialogDescription>
        </DialogHeader>
        
        {view === 'main' && (
          <div className="flex flex-col gap-3 py-4">
            <button
              onClick={() => setView('export')}
              className="flex items-center gap-3 p-4 border rounded-xl hover:bg-muted transition-colors text-left"
            >
              <div className="bg-[var(--color-juse-blue-soft)] text-[var(--color-juse-blue)] p-2 rounded-lg">
                <Download className="size-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Exportar Datos</h4>
                <p className="text-xs text-muted-foreground">Guarda un archivo JSON en tu computadora con los datos de una tabla.</p>
              </div>
            </button>
            
            <button
              onClick={handleImportStart}
              disabled={isProcessing}
              className="flex items-center gap-3 p-4 border rounded-xl hover:bg-muted transition-colors text-left disabled:opacity-50"
            >
              <div className="bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 p-2 rounded-lg">
                <Upload className="size-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Importar Datos</h4>
                <p className="text-xs text-muted-foreground">Carga un archivo JSON previamente exportado a tu base de datos.</p>
              </div>
            </button>
          </div>
        )}
        
        {view === 'export' && (
          <div className="flex flex-col gap-2 py-4">
            <p className="text-sm font-medium mb-2">Selecciona qué tabla deseas exportar:</p>
            <button onClick={() => handleExport('contracts')} disabled={isProcessing} className="flex items-center gap-2 p-3 bg-muted rounded-md hover:bg-muted-foreground/10 text-sm font-medium disabled:opacity-50 text-left">
              <FileText className="size-4" /> Contratos
            </button>
            <button onClick={() => handleExport('packages')} disabled={isProcessing} className="flex items-center gap-2 p-3 bg-muted rounded-md hover:bg-muted-foreground/10 text-sm font-medium disabled:opacity-50 text-left">
              <Package className="size-4" /> Paquetes
            </button>
            <button onClick={() => handleExport('events')} disabled={isProcessing} className="flex items-center gap-2 p-3 bg-muted rounded-md hover:bg-muted-foreground/10 text-sm font-medium disabled:opacity-50 text-left">
              <PartyPopper className="size-4" /> Eventos
            </button>
            
            <button onClick={() => setView('main')} className="text-sm text-muted-foreground hover:text-foreground mt-4 text-center cursor-pointer">
              ← Volver
            </button>
          </div>
        )}
        
        {view === 'import-confirm' && importPayload && (
          <div className="flex flex-col gap-4 py-4">
            <div className="bg-muted p-4 rounded-lg flex flex-col gap-1 items-center justify-center text-center">
              <Database className="size-8 text-[var(--color-juse-blue)] mb-2" />
              <p className="font-semibold text-sm text-foreground">Archivo analizado correctamente</p>
              <p className="text-xs text-muted-foreground">
                Se detectaron <strong>{importPayload.data.length}</strong> registros listos para los <strong>{TABLE_NAMES_ES[importPayload.table] || importPayload.table}</strong>.
              </p>
            </div>
            
            <p className="text-sm font-medium">¿Cómo deseas importar esta información?</p>
            
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleImportConfirm('append')}
                disabled={isProcessing}
                className="flex flex-col items-start p-3 border border-[var(--color-juse-blue)] bg-[var(--color-juse-blue-soft)]/10 dark:bg-[var(--color-juse-blue-soft)]/20 rounded-md hover:bg-[var(--color-juse-blue-soft)]/30 transition-colors cursor-pointer disabled:opacity-50"
              >
                <span className="font-semibold text-sm text-[var(--color-juse-blue)]">Agregar registros</span>
                <span className="text-xs text-muted-foreground mt-1 text-left">Los datos se sumarán a lo que ya tienes. No se borrará nada.</span>
              </button>
              
              <button
                onClick={() => handleImportConfirm('replace')}
                disabled={isProcessing}
                className="flex flex-col items-start p-3 border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-500/10 rounded-md hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors cursor-pointer disabled:opacity-50"
              >
                <span className="font-semibold text-sm text-red-600 dark:text-red-400">Reemplazar tabla completa</span>
                <span className="text-xs text-red-600/80 dark:text-red-400/80 mt-1 text-left">¡Cuidado! Esto vaciará la tabla actual antes de importar los nuevos datos.</span>
              </button>
            </div>
            
            <button onClick={() => setView('main')} className="text-sm text-muted-foreground hover:text-foreground mt-2 text-center cursor-pointer">
              Cancelar
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
