import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { usePackages } from '@/hooks/use-packages';
import type { JusePackage } from '@/types/package';
import { PackageFormSheet } from './package-form-sheet';

export function PackagesTable() {
  const { packages, deletePackage } = usePackages();
  const [formOpen, setFormOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<JusePackage | undefined>(undefined);

  const handleEdit = (pkg: JusePackage) => {
    setEditingPackage(pkg);
    setFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingPackage(undefined);
    setFormOpen(true);
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">Paquetes</h2>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 bg-[var(--color-juse-blue)] text-white px-4 py-2 rounded-lg hover:brightness-110 transition-all shadow-sm text-sm font-medium"
        >
          <Plus className="size-4" />
          Nuevo Paquete
        </button>
      </div>

      <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-800 text-xs uppercase font-semibold sticky top-0 border-b border-slate-200 z-10">
              <tr>
                <th className="px-4 py-3 whitespace-nowrap">Nro Paquete</th>
                <th className="px-4 py-3 min-w-[300px]">Especificaciones</th>
                <th className="px-4 py-3 whitespace-nowrap text-right">Precio (S/)</th>
                <th className="px-4 py-3 whitespace-nowrap">Movilidad</th>
                <th className="px-4 py-3 whitespace-nowrap">Tipo Evento</th>
                <th className="px-4 py-3 whitespace-nowrap text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {packages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No hay paquetes registrados. Crea uno nuevo para comenzar.
                  </td>
                </tr>
              ) : (
                packages.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">{pkg.nroPaquete}</td>
                    <td className="px-4 py-3 text-xs leading-relaxed">
                      {Array.isArray(pkg.especificaciones) 
                        ? pkg.especificaciones.reduce((acc: string, curr: any, idx: number, arr: any[]) => {
                            if (idx === 0) return typeof curr === 'string' ? curr : curr.value;
                            const isSpecial = typeof curr === 'string' ? false : curr.isSpecial;
                            const prevWasSpecial = typeof arr[idx - 1] === 'string' ? false : arr[idx - 1].isSpecial;
                            const separator = (isSpecial || prevWasSpecial) ? ' --- ' : ' / ';
                            return acc + separator + (typeof curr === 'string' ? curr : curr.value);
                          }, '')
                        : pkg.especificaciones}
                    </td>
                    <td className="px-4 py-3 text-right font-medium whitespace-nowrap">{pkg.precio.toFixed(2)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs">{pkg.movilidad}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-800">
                        {pkg.tipoEvento}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(pkg)}
                          className="p-1.5 text-slate-400 hover:text-[var(--color-juse-blue)] hover:bg-blue-50 rounded-md transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="size-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('¿Eliminar este paquete?')) {
                              deletePackage(pkg.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PackageFormSheet
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initialData={editingPackage}
      />
    </div>
  );
}
