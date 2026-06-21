import { useContracts } from "@/hooks/use-contracts";
import { usePackages } from "@/hooks/use-packages";
import type { JuseContract } from "@/types/contract";
import { generarContratoPDF, generarReciboPDF } from "@/utils/pdfGenerator";
import { sileo } from "sileo";
import { Download, Edit2, Eye, FileText, Plus, Trash2, FileSignature } from "lucide-react";
import { useState } from "react";
import { ContractClientSheet } from "./contract-client-sheet";
import { ContractFormSheet } from "./contract-form-sheet";
import { ContractViewSheet } from "./contract-view-sheet";
import { formatPhoneNumber } from "@/lib/utils";
import { ContextMenu, ContextMenuTrigger, ContextMenuPopup, ContextMenuItem, ContextMenuSeparator, ContextMenuGroup, ContextMenuGroupLabel } from "@/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export function ContractsTable() {
  const { contracts, deleteContract } = useContracts();
  const { packages } = usePackages();
  const [formOpen, setFormOpen] = useState(false);
  const [viewingContract, setViewingContract] = useState<
    JuseContract | undefined
  >(undefined);
  const [editingContract, setEditingContract] = useState<
    JuseContract | undefined
  >(undefined);
  const [selectedClientContract, setSelectedClientContract] = useState<
    JuseContract | undefined
  >(undefined);
  const [contractToDelete, setContractToDelete] = useState<JuseContract | null>(null);

  const confirmDelete = () => {
    if (contractToDelete) {
      deleteContract(contractToDelete.id);
      sileo.success({ title: 'Contrato eliminado', description: `El contrato ${contractToDelete.contratoNumber} se ha eliminado exitosamente` });
      setContractToDelete(null);
    }
  };

  const handleEdit = (contract: JuseContract) => {
    setEditingContract(contract);
    setFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingContract(undefined);
    setFormOpen(true);
  };

  const handleGeneratePDF = (contract: JuseContract, type: 'recibo' | 'contrato') => {
    const paqueteInfo = packages.find((p) => p.id === contract.paqueteId);
    const data = { ...contract, paqueteNombre: paqueteInfo?.nroPaquete };
    if (type === 'recibo') generarReciboPDF(data);
    else generarContratoPDF(data);
  };

  return (
    <>
    <ContextMenu>
      <ContextMenuTrigger className="flex flex-col gap-4 h-full relative" style={{ display: 'flex' }}>
        <div className='flex items-center justify-between shrink-0'>
          <h2 className='text-lg font-semibold text-slate-800'>Contratos</h2>
          <button
            onClick={handleAddNew}
            className='flex items-center gap-2 bg-[var(--color-juse-blue)] text-white px-4 py-2 rounded-lg hover:brightness-110 transition-all shadow-sm text-sm font-medium cursor-pointer'>
            <Plus className='size-4' />
            Nuevo Contrato
          </button>
        </div>

        <div className='flex-1 bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col'>
          <div className='overflow-auto flex-1'>
            <table className='w-full text-left text-sm text-slate-600'>
              <thead className='bg-slate-50 text-slate-800 text-xs uppercase font-semibold sticky top-0 border-b border-slate-200 z-10'>
                <tr>
                  <th className='px-4 py-3 whitespace-nowrap'>Contrato</th>
                  <th className='px-4 py-3 whitespace-nowrap'>Fecha Evento</th>
                  <th className='px-4 py-3 min-w-[200px]'>Cliente</th>
                  <th className='px-4 py-3 whitespace-nowrap'>Teléfono</th>
                  <th className='px-4 py-3 whitespace-nowrap'>DNI</th>
                  <th className='px-4 py-3 min-w-[200px]'>Ubicación</th>
                  <th className='px-4 py-3 whitespace-nowrap'>Tipo Evento</th>
                  <th className='px-4 py-3 whitespace-nowrap'>Paquete</th>
                  <th className='px-4 py-3 whitespace-nowrap text-right'>Precio</th>
                  <th className='px-4 py-3 whitespace-nowrap text-right'>A Cuenta</th>
                  <th className='px-4 py-3 whitespace-nowrap text-right'>Saldo</th>
                  <th className='px-4 py-3 whitespace-nowrap text-right'>Acciones</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-100'>
                {contracts.length === 0 ? (
                  <tr>
                    <td colSpan={12} className='px-4 py-8 text-center text-slate-500'>
                      No hay contratos registrados. Crea uno nuevo para comenzar.
                    </td>
                  </tr>
                ) : (
                  contracts
                    .sort((a, b) => a.contratoNumber.localeCompare(b.contratoNumber))
                    .map((contract) => (
                      <ContextMenu key={contract.id}>
                        <ContextMenuTrigger render={<tr className='hover:bg-slate-50/50 transition-colors' />}>
                          <td className='px-4 py-3 whitespace-nowrap'>
                            <div className='font-semibold text-slate-900'>{contract.contratoNumber}</div>
                            <div className='text-xs text-slate-500'>{contract.fechaEmision}</div>
                          </td>
                          <td className='px-4 py-3 whitespace-nowrap'>
                            {contract.fechaEvento}
                            <span className='block text-xs text-slate-400'>{contract.horaEvento}</span>
                          </td>
                          <td className='px-4 py-3'>
                            <div className='font-medium text-slate-900'>{contract.clienteNombre}</div>
                          </td>
                          <td className='px-4 py-3 whitespace-nowrap text-slate-600'>
                            {formatPhoneNumber(contract.clienteCelular) || "-"}
                          </td>
                          <td className='px-4 py-3 whitespace-nowrap text-slate-600'>
                            {contract.clienteDni || "-"}
                          </td>
                          <td className='px-4 py-3 text-xs text-slate-600 whitespace-normal min-w-[200px]'>
                            {contract.clienteDireccion || "-"}
                          </td>
                          <td className='px-4 py-3 whitespace-nowrap text-slate-800 font-medium'>
                            {contract.tipoEvento}
                          </td>
                          <td className='px-4 py-3 whitespace-nowrap text-slate-800 font-medium'>
                            {packages.find((p) => p.id === contract.paqueteId)?.nroPaquete || "Ver Paquete"}
                          </td>
                          <td className='px-4 py-3 text-right font-medium whitespace-nowrap'>S/ {contract.precio.toFixed(2)}</td>
                          <td className='px-4 py-3 text-right font-medium whitespace-nowrap'>S/ {contract.aCuenta.toFixed(2)}</td>
                          <td className='px-4 py-3 text-right font-medium whitespace-nowrap text-[var(--color-juse-red)]'>S/ {contract.saldo.toFixed(2)}</td>
                          <td className='px-4 py-3 whitespace-nowrap text-right'>
                            <div className='flex items-center justify-end gap-1'>
                              <button onClick={() => setViewingContract(contract)} className='p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer' title='Visualizar'><Eye className='size-4' /></button>
                              <button onClick={() => handleGeneratePDF(contract, "contrato")} className='p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors cursor-pointer' title='Descargar Contrato'><FileText className='size-4' /></button>
                              <button onClick={() => handleGeneratePDF(contract, "recibo")} className='p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer' title='Descargar Recibo'><Download className='size-4' /></button>
                              <button onClick={() => handleEdit(contract)} className='p-1.5 text-slate-400 hover:text-[var(--color-juse-blue)] hover:bg-blue-50 rounded-md transition-colors cursor-pointer' title='Editar'><Edit2 className='size-4' /></button>
                              <button onClick={() => setContractToDelete(contract)} className='p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer' title='Eliminar'><Trash2 className='size-4' /></button>
                            </div>
                          </td>
                        </ContextMenuTrigger>
                        <ContextMenuPopup>
                        <ContextMenuGroup>
                          <ContextMenuGroupLabel>Contrato</ContextMenuGroupLabel>
                          <ContextMenuItem onClick={() => setViewingContract(contract)} className="cursor-pointer">
                            <Eye className="mr-2 size-4" /> Ver Detalles
                          </ContextMenuItem>
                          <ContextMenuItem onClick={() => handleEdit(contract)} className="cursor-pointer">
                            <Edit2 className="mr-2 size-4" /> Editar
                          </ContextMenuItem>
                          <ContextMenuSeparator />
                          <ContextMenuItem onClick={() => handleGeneratePDF(contract, "recibo")} className="cursor-pointer">
                            <FileText className="mr-2 size-4" /> Generar Recibo
                          </ContextMenuItem>
                          <ContextMenuItem onClick={() => handleGeneratePDF(contract, "contrato")} className="cursor-pointer">
                            <FileSignature className="mr-2 size-4" /> Generar Contrato
                          </ContextMenuItem>
                          <ContextMenuSeparator />
                          <ContextMenuItem onClick={() => setContractToDelete(contract)} className="text-red-600 cursor-pointer">
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
            <Plus className="mr-2 size-4" /> Nuevo Contrato
          </ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenuPopup>
    </ContextMenu>

      <ContractFormSheet
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initialData={editingContract}
      />

      <Dialog open={!!contractToDelete} onOpenChange={(open) => !open && setContractToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar contrato</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar el contrato {contractToDelete?.contratoNumber}? Esta acción no se
              puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 sm:gap-0 mt-2">
            <button
              type="button"
              onClick={() => setContractToDelete(null)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--color-juse-red)] hover:brightness-110 rounded-lg transition-all shadow-sm"
            >
              <Trash2 className="size-4" />
              Eliminar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ContractClientSheet
        open={!!selectedClientContract}
        onClose={() => setSelectedClientContract(undefined)}
        contract={selectedClientContract}
      />

      <ContractViewSheet
        open={!!viewingContract}
        onClose={() => setViewingContract(undefined)}
        contract={viewingContract}
      />
    </>
  );
}
