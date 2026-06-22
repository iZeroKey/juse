import { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, ArrowUpDown, ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type SortingState,
} from '@tanstack/react-table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo(() => [
    {
      accessorKey: 'nroPaquete',
      header: 'Nro Paquete',
      cell: (info: any) => <div className="font-medium text-foreground whitespace-nowrap">{info.getValue()}</div>
    },
    {
      accessorKey: 'especificaciones',
      header: 'Especificaciones',
      cell: (info: any) => <div className="text-xs leading-relaxed whitespace-normal">{String(info.getValue() || '')}</div>,
      meta: { className: 'min-w-[300px]' }
    },
    {
      accessorKey: 'precio',
      header: 'Precio (S/)',
      cell: (info: any) => <div className="text-right font-medium whitespace-nowrap">{Number(info.getValue() || 0).toFixed(2)}</div>,
      meta: { className: 'text-right justify-end' }
    },
    {
      accessorKey: 'movilidad',
      header: 'Movilidad',
      cell: (info: any) => <div className="whitespace-nowrap text-xs">{info.getValue()}</div>
    },
    {
      accessorKey: 'tipoEvento',
      header: 'Tipo Evento',
      cell: (info: any) => (
        <div className="whitespace-nowrap">
          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
            {info.getValue()}
          </span>
        </div>
      )
    }
  ], []);

  const [pagination, setPagination] = useState(() => {
    const saved = localStorage.getItem('packagesPageSize');
    return {
      pageIndex: 0,
      pageSize: saved ? parseInt(saved, 10) : 10,
    };
  });

  const table = useReactTable({
    data: packages,
    columns,
    state: { 
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: (updater) => {
      setPagination((old) => {
        const newPagination = typeof updater === 'function' ? updater(old) : updater;
        if (old.pageSize !== newPagination.pageSize) {
          localStorage.setItem('packagesPageSize', newPagination.pageSize.toString());
        }
        return newPagination;
      });
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

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
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => {
                    const meta = header.column.columnDef.meta as any;
                    return (
                      <th
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        className={`px-4 py-3 whitespace-nowrap cursor-pointer hover:bg-muted-foreground/10 transition-colors select-none ${meta?.className || ''}`}
                      >
                        <div className={`flex items-center gap-1.5 ${meta?.className?.includes('justify-end') ? 'justify-end' : ''}`}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <div className="flex flex-col items-center justify-center opacity-50 relative w-3 h-3 ml-1">
                            <ArrowUpDown 
                              className={`w-3 h-3 absolute transition-all duration-300 ${
                                header.column.getIsSorted() ? "opacity-0 scale-50" : "opacity-100 scale-100"
                              }`} 
                              />
                              <ArrowDown 
                                className={`w-3 h-3 absolute transition-all duration-300 ${
                                  !header.column.getIsSorted() ? "opacity-0 scale-50" : "opacity-100 scale-100"
                                } ${
                                  header.column.getIsSorted() === 'asc' ? "rotate-180" : "rotate-0"
                                }`} 
                              />
                            </div>
                          </div>
                        </th>
                      );
                    })}
                    <th className="px-4 py-3 whitespace-nowrap text-right">Acciones</th>
                  </tr>
                ))}
            </thead>
            <tbody className="divide-y divide-border">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No hay paquetes registrados. Crea uno nuevo para comenzar.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => {
                  const pkg = row.original;
                  return (
                    <ContextMenu key={pkg.id}>
                      <ContextMenuTrigger render={<tr className="hover:bg-muted/50 transition-colors" />}>
                        {row.getVisibleCells().map(cell => {
                          const meta = cell.column.columnDef.meta as any;
                          return (
                            <td key={cell.id} className={`px-4 py-3 ${meta?.className?.includes('justify-end') ? 'text-right' : ''}`}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          );
                        })}
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
                  );
                })
              )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Mostrar</span>
              <Select
                value={String(table.getState().pagination.pageSize)}
                onValueChange={(value) => table.setPageSize(Number(value))}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 30, 40, 50].map(pageSize => (
                    <SelectItem key={pageSize} value={String(pageSize)}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span>filas</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                Página <strong className="text-foreground">{table.getState().pagination.pageIndex + 1}</strong> de <strong className="text-foreground">{table.getPageCount()}</strong>
              </span>
              <div className="flex items-center gap-1">
                <button
                  className="h-8 w-8 p-0 flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </button>
                <button
                  className="h-8 w-8 p-0 flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  className="h-8 w-8 p-0 flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  className="h-8 w-8 p-0 flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronsRight className="h-4 w-4" />
                </button>
              </div>
            </div>
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
              ¿Estás seguro de que deseas eliminar el paquete "{packageToDelete?.nroPaquete}"? Esta acción no se puede deshacer.
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
