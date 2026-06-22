import { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, ArrowUpDown, ArrowDown, ArrowUp } from 'lucide-react';
import { usePackages } from '@/hooks/use-packages';
import { ContextMenu, ContextMenuTrigger, ContextMenuPopup, ContextMenuItem, ContextMenuSeparator, ContextMenuGroup, ContextMenuGroupLabel } from "@/components/ui/context-menu";
import type { JusePackage } from '@/types/package';
import { PackageFormSheet } from './package-form-sheet';
import { sileo } from 'sileo';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export function PackagesTable() {
  const { packages, deletePackage } = usePackages();
  const [formOpen, setFormOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<JusePackage | undefined>(undefined);
  const [packageToDelete, setPackageToDelete] = useState<JusePackage | null>(null);

  type SortColumn = 'nroPaquete' | 'especificaciones' | 'precio' | 'movilidad' | 'tipoEvento';
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedPackages = useMemo(() => {
    return [...packages].sort((a, b) => {
      if (!sortColumn) return 0;
      
      let aVal: any = a[sortColumn as keyof JusePackage];
      let bVal: any = b[sortColumn as keyof JusePackage];
      
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [packages, sortColumn, sortDirection]);

  const confirmDelete = () => {
    if (packageToDelete) {
      deletePackage(packageToDelete.id);
      sileo.success({ title: 'Paquete eliminado', description: `El paquete "${packageToDelete.nombre}" se ha eliminado exitosamente` });
      setPackageToDelete(null);
    }
  };

  const handleEdit = (pkg: JusePackage) => {
    setEditingPackage(pkg);
    setFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingPackage(undefined);
    setFormOpen(true);
  };

  return (
    <>
    <ContextMenu>
      <ContextMenuTrigger className="flex flex-col gap-4 h-full relative" style={{ display: 'flex' }}>
        <div className="flex items-center justify-between shrink-0">
          <h2 className="text-lg font-semibold text-foreground">Paquetes</h2>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-[var(--color-juse-blue)] text-white px-4 py-2 rounded-lg hover:brightness-110 transition-all shadow-sm text-sm font-medium cursor-pointer"
          >
            <Plus className="size-4" />
            Nuevo Paquete
          </button>
        </div>

        <div className="flex-1 bg-card border border-border rounded-xl shadow-xs overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left text-sm text-muted-foreground">
            <thead className="bg-muted text-foreground text-xs uppercase font-semibold sticky top-0 border-b border-border z-10">
              <tr>
                {[
                  { key: 'nroPaquete', label: 'Nro Paquete' },
                  { key: 'especificaciones', label: 'Especificaciones', className: 'min-w-[300px]' },
                  { key: 'precio', label: 'Precio (S/)', className: 'text-right justify-end' },
                  { key: 'movilidad', label: 'Movilidad' },
                  { key: 'tipoEvento', label: 'Tipo Evento' }
                ].map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key as SortColumn)}
                    className={`px-4 py-3 whitespace-nowrap cursor-pointer hover:bg-muted-foreground/10 transition-colors select-none ${col.className || ''}`}
                  >
                    <div className={`flex items-center gap-1.5 ${col.className?.includes('justify-end') ? 'justify-end' : ''}`}>
                      {col.label}
                      <div className="flex flex-col items-center justify-center opacity-50 relative w-3 h-3 ml-1">
                        <ArrowUpDown 
                          className={`w-3 h-3 absolute transition-all duration-300 ${
                            sortColumn === col.key ? "opacity-0 scale-50" : "opacity-100 scale-100"
                          }`} 
                        />
                        <ArrowDown 
                          className={`w-3 h-3 absolute transition-all duration-300 ${
                            sortColumn !== col.key ? "opacity-0 scale-50" : "opacity-100 scale-100"
                          } ${
                            sortColumn === col.key && sortDirection === 'asc' ? "rotate-180" : "rotate-0"
                          }`} 
                        />
                      </div>
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 whitespace-nowrap text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {packages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No hay paquetes registrados. Crea uno nuevo para comenzar.
                  </td>
                </tr>
              ) : (
                sortedPackages.map((pkg) => (
                  <ContextMenu key={pkg.id}>
                    <ContextMenuTrigger render={<tr className="hover:bg-muted/50 transition-colors" />}>
                      <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">{pkg.nroPaquete}</td>
                      <td className="px-4 py-3 text-xs leading-relaxed">
                        {String(pkg.especificaciones || '')}
                      </td>
                      <td className="px-4 py-3 text-right font-medium whitespace-nowrap">{pkg.precio.toFixed(2)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs">{pkg.movilidad}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                          {pkg.tipoEvento}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(pkg)}
                            className="p-1.5 text-muted-foreground hover:text-[var(--color-juse-blue)] hover:bg-[var(--color-juse-blue-soft)] rounded-md transition-colors cursor-pointer"
                            title="Editar"
                          >
                            <Edit2 className="size-4" />
                          </button>
                          <button
                            onClick={() => setPackageToDelete(pkg)}
                            className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors cursor-pointer"
                            title="Eliminar"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </ContextMenuTrigger>
                    <ContextMenuPopup>
                      <ContextMenuGroup>
                        <ContextMenuGroupLabel>Paquete</ContextMenuGroupLabel>
                        <ContextMenuItem onClick={() => handleEdit(pkg)} className="cursor-pointer">
                          <Edit2 className="mr-2 size-4" /> Editar
                        </ContextMenuItem>
                        <ContextMenuSeparator />
                        <ContextMenuItem onClick={() => setPackageToDelete(pkg)} className="text-red-600 cursor-pointer">
                          <Trash2 className="mr-2 size-4" /> Eliminar
                        </ContextMenuItem>
                      </ContextMenuGroup>
                    </ContextMenuPopup>
                  </ContextMenu>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      </ContextMenuTrigger>
      <ContextMenuPopup>
        <ContextMenuGroup>
          <ContextMenuGroupLabel>Acciones</ContextMenuGroupLabel>
          <ContextMenuItem onClick={handleAddNew} className="cursor-pointer">
            <Plus className="mr-2 size-4" /> Nuevo Paquete
          </ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenuPopup>
    </ContextMenu>

      <PackageFormSheet
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initialData={editingPackage}
      />

      <Dialog open={!!packageToDelete} onOpenChange={(open) => !open && setPackageToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar paquete</DialogTitle>
            <DialogDescription>
                ¿Estás seguro de que deseas eliminar el paquete "{packageToDelete?.nombre}"? Esta acción no se
              puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 sm:gap-3 mt-2">
            <button
              type="button"
              onClick={() => setPackageToDelete(null)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--color-juse-red)] hover:brightness-110 rounded-lg transition-all shadow-sm cursor-pointer"
            >
              <Trash2 className="size-4" />
              Eliminar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
