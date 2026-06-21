import { useContracts } from "@/hooks/use-contracts";
import { usePackages } from "@/hooks/use-packages";
import type { JuseContract } from "@/types/contract";
import { generarContratoPDF, generarReciboPDF } from "@/utils/pdfGenerator";
import { Download, Edit2, Eye, FileText, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { ContractClientSheet } from "./contract-client-sheet";
import { ContractFormSheet } from "./contract-form-sheet";
import { ContractViewSheet } from "./contract-view-sheet";

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

  const handleEdit = (contract: JuseContract) => {
    setEditingContract(contract);
    setFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingContract(undefined);
    setFormOpen(true);
  };

  return (
    <div className='flex flex-col gap-4 h-full'>
      <div className='flex items-center justify-between'>
        <h2 className='text-lg font-semibold text-slate-800'>Contratos</h2>
        <button
          onClick={handleAddNew}
          className='flex items-center gap-2 bg-[var(--color-juse-blue)] text-white px-4 py-2 rounded-lg hover:brightness-110 transition-all shadow-sm text-sm font-medium'>
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
                <th className='px-4 py-3 whitespace-nowrap text-right'>
                  Precio
                </th>
                <th className='px-4 py-3 whitespace-nowrap text-right'>
                  A Cuenta
                </th>
                <th className='px-4 py-3 whitespace-nowrap text-right'>
                  Saldo
                </th>
                <th className='px-4 py-3 whitespace-nowrap text-right'>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100'>
              {contracts.length === 0 ? (
                <tr>
                  <td
                    colSpan={12}
                    className='px-4 py-8 text-center text-slate-500'>
                    No hay contratos registrados. Crea uno nuevo para comenzar.
                  </td>
                </tr>
              ) : (
                contracts
                  .sort((a, b) =>
                    a.contratoNumber.localeCompare(b.contratoNumber),
                  )
                  .map((contract) => (
                    <tr
                      key={contract.id}
                      className='hover:bg-slate-50/50 transition-colors'>
                      <td className='px-4 py-3 whitespace-nowrap'>
                        <div className='font-semibold text-slate-900'>
                          {contract.contratoNumber}
                        </div>
                        <div className='text-xs text-slate-500'>
                          {contract.fechaEmision}
                        </div>
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap'>
                        {contract.fechaEvento}
                        <span className='block text-xs text-slate-400'>
                          {contract.horaEvento}
                        </span>
                      </td>
                      <td className='px-4 py-3'>
                        <div className='flex items-center w-full p-2 -ml-2 text-left'>
                          <div className='font-medium text-slate-900 leading-tight'>
                            {contract.clienteNombre}
                          </div>
                        </div>
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap text-slate-600'>
                        {contract.clienteCelular || "-"}
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
                        {packages.find((p) => p.id === contract.paqueteId)
                          ?.nroPaquete || "Ver Paquete"}
                      </td>
                      <td className='px-4 py-3 text-right font-medium whitespace-nowrap'>
                        S/ {contract.precio.toFixed(2)}
                      </td>
                      <td className='px-4 py-3 text-right font-medium whitespace-nowrap'>
                        S/ {contract.aCuenta.toFixed(2)}
                      </td>
                      <td className='px-4 py-3 text-right font-medium whitespace-nowrap text-[var(--color-juse-red)]'>
                        S/ {contract.saldo.toFixed(2)}
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap text-right'>
                        <div className='flex items-center justify-end gap-1'>
                          <button
                            onClick={() => setViewingContract(contract)}
                            className='p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors'
                            title='Visualizar'>
                            <Eye className='size-4' />
                          </button>
                          <button
                            onClick={() => {
                              // Obtenemos el nombre del paquete de la lista que ya tienes cargada
                              const paqueteInfo = packages.find(
                                (p) => p.id === contract.paqueteId,
                              );
                              // Creamos un clon del contrato inyectando el paqueteNombre
                              generarContratoPDF({
                                ...contract,
                                paqueteNombre: paqueteInfo?.nroPaquete,
                              });
                            }}
                            className='p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors'
                            title='Descargar Contrato'>
                            <FileText className='size-4' />
                          </button>
                          <button
                            onClick={() => {
                              const paqueteInfo = packages.find(
                                (p) => p.id === contract.paqueteId,
                              );
                              generarReciboPDF({
                                ...contract,
                                paqueteNombre: paqueteInfo?.nroPaquete,
                              });
                            }}
                            className='p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors'
                            title='Descargar Recibo'>
                            <Download className='size-4' />
                          </button>
                          <button
                            onClick={() => handleEdit(contract)}
                            className='p-1.5 text-slate-400 hover:text-[var(--color-juse-blue)] hover:bg-blue-50 rounded-md transition-colors'
                            title='Editar'>
                            <Edit2 className='size-4' />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm("¿Eliminar este contrato?")) {
                                deleteContract(contract.id);
                              }
                            }}
                            className='p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors'
                            title='Eliminar'>
                            <Trash2 className='size-4' />
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

      <ContractFormSheet
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initialData={editingContract}
      />

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
    </div>
  );
}
