import { useContracts } from "@/hooks/use-contracts";

import type { JuseContract } from "@/types/contract";
import { generarContratoPDF, generarReciboPDF } from "@/utils/pdfGenerator";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Edit2,
  Eye,
  FileSignature,
  FileText,
  Plus,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { sileo } from "sileo";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPhoneNumber } from "@/lib/utils";
import { format, isValid, parse } from "date-fns";
import { es } from "date-fns/locale";
import { ContractClientSheet } from "./contract-client-sheet";
import { ContractFormSheet } from "./contract-form-sheet";
import { ContractViewSheet } from "./contract-view-sheet";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";

import {
  ContextMenu,
  ContextMenuGroup,
  ContextMenuGroupLabel,
  ContextMenuItem,
  ContextMenuPopup,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function ContractsTable() {
  const { contracts, deleteContract } = useContracts();
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
  const [contractToDelete, setContractToDelete] = useState<JuseContract | null>(
    null,
  );

  const [sorting, setSorting] = useState<SortingState>([]);
  const [fromDateStr, setFromDateStr] = useState("");
  const [toDateStr, setToDateStr] = useState("");

  const parseDateForFilter = (val: string) => {
    if (!val) return 0;
    if (val.includes("-")) return new Date(val).getTime();
    const parts = val.split("/");
    if (parts.length === 3)
      return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime();
    return 0;
  };

  const filteredContracts = useMemo(() => {
    return contracts.filter((contract) => {
      if (!fromDateStr && !toDateStr) return true;

      const time = parseDateForFilter(contract.fechaEvento);
      if (!time) return false;

      const eventDate = new Date(time);
      eventDate.setHours(0, 0, 0, 0);

      if (fromDateStr) {
        const parsedFrom = parse(fromDateStr, "yyyy-MM-dd", new Date());
        if (isValid(parsedFrom)) {
          const fromDate = new Date(parsedFrom);
          fromDate.setHours(0, 0, 0, 0);
          if (eventDate.getTime() < fromDate.getTime()) return false;
        }
      }

      if (toDateStr) {
        const parsedTo = parse(toDateStr, "yyyy-MM-dd", new Date());
        if (isValid(parsedTo)) {
          const toDate = new Date(parsedTo);
          toDate.setHours(23, 59, 59, 999);
          if (eventDate.getTime() > toDate.getTime()) return false;
        }
      }

      return true;
    });
  }, [contracts, fromDateStr, toDateStr]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "contratoNumber",
        header: "Contrato",
        cell: (info: {
          getValue: () => unknown;
          row: { original: JuseContract };
        }) => (
          <>
            <div className='font-semibold text-foreground'>
              {String(info.getValue())}
            </div>
            <div className='text-xs text-muted-foreground'>
              {info.row.original.fechaEmision}
            </div>
          </>
        ),
      },
      {
        accessorKey: "fechaEvento",
        header: "Fecha Evento",
        cell: (info: {
          getValue: () => unknown;
          row: { original: JuseContract };
        }) => (
          <>
            {String(info.getValue())}
            <span className='block text-xs text-muted-foreground'>
              {info.row.original.horaEvento}
            </span>
          </>
        ),
      },
      {
        accessorKey: "clienteNombre",
        header: "Cliente",
        cell: (info: { getValue: () => unknown }) => (
          <div className='font-medium text-foreground'>
            {String(info.getValue())}
          </div>
        ),
        meta: { className: "min-w-[200px]" },
      },
      {
        accessorKey: "clienteCelular",
        header: "Teléfono",
        cell: (info: { getValue: () => unknown }) => (
          <div className='text-muted-foreground'>
            {formatPhoneNumber(String(info.getValue())) || "-"}
          </div>
        ),
      },
      {
        accessorKey: "clienteDni",
        header: "DNI",
        cell: (info: { getValue: () => unknown }) => (
          <div className='text-muted-foreground'>
            {String(info.getValue() || "") || "-"}
          </div>
        ),
      },
      {
        accessorKey: "clienteDireccion",
        header: "Ubicación",
        cell: (info: { getValue: () => unknown }) => (
          <div className='text-xs text-muted-foreground whitespace-normal min-w-50'>
            {String(info.getValue() || "") || "-"}
          </div>
        ),
        meta: { className: "min-w-[200px]" },
      },
      {
        accessorKey: "tipoEvento",
        header: "Tipo Evento",
        cell: (info: { getValue: () => unknown }) => (
          <div className='text-foreground font-medium'>
            {String(info.getValue())}
          </div>
        ),
      },
      {
        accessorKey: "paqueteNombre",
        header: "Paquete",
        cell: (info: { getValue: () => unknown }) => (
          <div className='text-foreground font-medium'>
            {String(info.getValue() || "") || "Sin Nombre"}
          </div>
        ),
      },
      {
        accessorKey: "precio",
        header: "Precio",
        cell: (info: { getValue: () => unknown }) => (
          <div className='font-medium whitespace-nowrap'>
            S/ {Number(info.getValue() || 0).toFixed(2)}
          </div>
        ),
        meta: { className: "text-right justify-end" },
      },
      {
        accessorKey: "aCuenta",
        header: "A Cuenta",
        cell: (info: { getValue: () => unknown }) => (
          <div className='font-medium whitespace-nowrap'>
            S/ {Number(info.getValue() || 0).toFixed(2)}
          </div>
        ),
        meta: { className: "text-right justify-end" },
      },
      {
        accessorKey: "saldo",
        header: "Saldo",
        cell: (info: { getValue: () => unknown }) => (
          <div className='font-medium whitespace-nowrap text-(--color-juse-red)'>
            S/ {Number(info.getValue() || 0).toFixed(2)}
          </div>
        ),
        meta: { className: "text-right justify-end" },
      },
    ],
    [],
  );

  const [pagination, setPagination] = useState(() => {
    const saved = localStorage.getItem("contractsPageSize");
    return {
      pageIndex: 0,
      pageSize: saved ? parseInt(saved, 10) : 10,
    };
  });

  const table = [useReactTable][0]({
    data: filteredContracts,
    columns,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: (updater) => {
      setPagination((old) => {
        const newPagination =
          typeof updater === "function" ? updater(old) : updater;
        if (old.pageSize !== newPagination.pageSize) {
          localStorage.setItem(
            "contractsPageSize",
            newPagination.pageSize.toString(),
          );
        }
        return newPagination;
      });
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const confirmDelete = () => {
    if (contractToDelete) {
      deleteContract(contractToDelete.id);
      sileo.success({
        title: "Contrato eliminado",
        description: `El contrato ${contractToDelete.contratoNumber} se ha eliminado exitosamente`,
      });
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

  const handleGeneratePDF = (
    contract: JuseContract,
    type: "recibo" | "contrato",
  ) => {
    const data = { ...contract };
    if (type === "recibo") generarReciboPDF(data);
    else generarContratoPDF(data);
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger
          className='flex flex-col gap-4 h-full relative'
          style={{ display: "flex" }}>
          <div className='flex items-center justify-between shrink-0'>
            <h2 className='text-lg font-semibold text-foreground'>Contratos</h2>
            <div className='flex items-center gap-3'>
              <div className='flex items-center gap-2'>
                <div className='relative flex items-center w-38.75'>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className='absolute left-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground focus-visible:outline-none z-10 cursor-pointer'>
                        <CalendarIcon className='size-4' />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0 z-100' align='start'>
                      <Calendar
                        mode='single'
                        selected={
                          fromDateStr
                            ? isValid(
                                parse(fromDateStr, "yyyy-MM-dd", new Date()),
                              )
                              ? parse(fromDateStr, "yyyy-MM-dd", new Date())
                              : undefined
                            : undefined
                        }
                        onSelect={(date) =>
                          setFromDateStr(date ? format(date, "yyyy-MM-dd") : "")
                        }
                        locale={es}
                      />
                      <div className='p-2 border-t border-border'>
                        <button
                          disabled={!fromDateStr}
                          onClick={() => setFromDateStr("")}
                          className='w-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground text-xs py-1.5 rounded transition-colors font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-muted/50 disabled:hover:text-muted-foreground'>
                          Limpiar
                        </button>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Input
                    type='date'
                    value={fromDateStr}
                    onChange={(e) => setFromDateStr(e.target.value)}
                    className='pl-9 h-9 text-sm [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:opacity-0'
                  />
                </div>

                <span className='text-muted-foreground text-sm'>-</span>

                <div className='relative flex items-center w-38.75'>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className='absolute left-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground focus-visible:outline-none z-10 cursor-pointer'>
                        <CalendarIcon className='size-4' />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0 z-100' align='start'>
                      <Calendar
                        mode='single'
                        selected={
                          toDateStr
                            ? isValid(
                                parse(toDateStr, "yyyy-MM-dd", new Date()),
                              )
                              ? parse(toDateStr, "yyyy-MM-dd", new Date())
                              : undefined
                            : undefined
                        }
                        onSelect={(date) =>
                          setToDateStr(date ? format(date, "yyyy-MM-dd") : "")
                        }
                        locale={es}
                      />
                      <div className='p-2 border-t border-border'>
                        <button
                          disabled={!toDateStr}
                          onClick={() => setToDateStr("")}
                          className='w-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground text-xs py-1.5 rounded transition-colors font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-muted/50 disabled:hover:text-muted-foreground'>
                          Limpiar
                        </button>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Input
                    type='date'
                    value={toDateStr}
                    onChange={(e) => setToDateStr(e.target.value)}
                    className='pl-9 h-9 text-sm [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:opacity-0'
                  />
                </div>
              </div>

              <button
                onClick={handleAddNew}
                className='flex items-center gap-2 bg-(--color-juse-blue) text-white px-4 py-2 rounded-lg hover:brightness-110 transition-all shadow-sm text-sm font-medium cursor-pointer'>
                <Plus className='size-4' />
                Nuevo Contrato
              </button>
            </div>
          </div>

          <div className='flex-1 bg-card border border-border rounded-xl shadow-xs overflow-hidden flex flex-col'>
            <div className='overflow-auto flex-1'>
              <table className='w-full text-left text-sm text-muted-foreground'>
                <thead className='bg-muted text-foreground text-xs uppercase font-semibold sticky top-0 border-b border-border z-10'>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id} className='contents'>
                      {headerGroup.headers.map((header) => {
                        const meta = header.column.columnDef.meta as
                          | { className?: string }
                          | undefined;
                        return (
                          <th
                            key={header.id}
                            onClick={header.column.getToggleSortingHandler()}
                            className={`px-4 py-3 whitespace-nowrap cursor-pointer hover:bg-muted-foreground/10 transition-colors select-none ${meta?.className || ""}`}>
                            <div
                              className={`flex items-center gap-1.5 ${meta?.className?.includes("justify-end") ? "justify-end" : ""}`}>
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                              <div className='flex flex-col items-center justify-center opacity-50 relative w-3 h-3 ml-1'>
                                <ArrowUpDown
                                  className={`w-3 h-3 absolute transition-all duration-300 ${
                                    header.column.getIsSorted()
                                      ? "opacity-0 scale-50"
                                      : "opacity-100 scale-100"
                                  }`}
                                />
                                <ArrowDown
                                  className={`w-3 h-3 absolute transition-all duration-300 ${
                                    !header.column.getIsSorted()
                                      ? "opacity-0 scale-50"
                                      : "opacity-100 scale-100"
                                  } ${
                                    header.column.getIsSorted() === "asc"
                                      ? "rotate-180"
                                      : "rotate-0"
                                  }`}
                                />
                              </div>
                            </div>
                          </th>
                        );
                      })}
                      <th className='px-4 py-3 whitespace-nowrap text-right'>
                        Acciones
                      </th>
                    </tr>
                  ))}
                </thead>
                <tbody className='divide-y divide-border'>
                  {table.getRowModel().rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={12}
                        className='px-4 py-8 text-center text-muted-foreground'>
                        {fromDateStr || toDateStr
                          ? "No hay contratos en este rango de fechas."
                          : "No hay contratos registrados. Crea uno nuevo para comenzar."}
                      </td>
                    </tr>
                  ) : (
                    table.getRowModel().rows.map((row) => {
                      const contract = row.original;
                      return (
                        <ContextMenu key={contract.id}>
                          <ContextMenuTrigger
                            render={
                              <tr className='hover:bg-muted/50 transition-colors' />
                            }>
                            {row.getVisibleCells().map((cell) => {
                              const meta = cell.column.columnDef.meta as
                                | { className?: string }
                                | undefined;
                              return (
                                <td
                                  key={cell.id}
                                  className={`px-4 py-3 whitespace-nowrap ${meta?.className?.includes("justify-end") ? "text-right" : ""}`}>
                                  {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext(),
                                  )}
                                </td>
                              );
                            })}
                            <td className='px-4 py-3 whitespace-nowrap text-right'>
                              <div className='flex items-center justify-end gap-1'>
                                <button
                                  onClick={() => setViewingContract(contract)}
                                  className='p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors cursor-pointer'
                                  title='Visualizar'>
                                  <Eye className='size-4' />
                                </button>
                                <button
                                  onClick={() =>
                                    handleGeneratePDF(contract, "contrato")
                                  }
                                  className='p-1.5 text-muted-foreground hover:text-indigo-500 hover:bg-indigo-500/10 rounded-md transition-colors cursor-pointer'
                                  title='Descargar Contrato'>
                                  <FileText className='size-4' />
                                </button>
                                <button
                                  onClick={() =>
                                    handleGeneratePDF(contract, "recibo")
                                  }
                                  className='p-1.5 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 rounded-md transition-colors cursor-pointer'
                                  title='Descargar Recibo'>
                                  <Download className='size-4' />
                                </button>
                                <button
                                  onClick={() => handleEdit(contract)}
                                  className='p-1.5 text-muted-foreground hover:text-(--color-juse-blue) hover:bg-(--color-juse-blue-soft) rounded-md transition-colors cursor-pointer'
                                  title='Editar'>
                                  <Edit2 className='size-4' />
                                </button>
                                <button
                                  onClick={() => setContractToDelete(contract)}
                                  className='p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors cursor-pointer'
                                  title='Eliminar'>
                                  <Trash2 className='size-4' />
                                </button>
                              </div>
                            </td>
                          </ContextMenuTrigger>
                          <ContextMenuPopup>
                            <ContextMenuGroup>
                              <ContextMenuGroupLabel>
                                Contrato
                              </ContextMenuGroupLabel>
                              <ContextMenuItem
                                onClick={() => setViewingContract(contract)}
                                className='cursor-pointer'>
                                <Eye className='mr-2 size-4' /> Ver Detalles
                              </ContextMenuItem>
                              <ContextMenuItem
                                onClick={() => handleEdit(contract)}
                                className='cursor-pointer'>
                                <Edit2 className='mr-2 size-4' /> Editar
                              </ContextMenuItem>
                              <ContextMenuSeparator />
                              <ContextMenuItem
                                onClick={() =>
                                  handleGeneratePDF(contract, "recibo")
                                }
                                className='cursor-pointer'>
                                <FileText className='mr-2 size-4' /> Generar
                                Recibo
                              </ContextMenuItem>
                              <ContextMenuItem
                                onClick={() =>
                                  handleGeneratePDF(contract, "contrato")
                                }
                                className='cursor-pointer'>
                                <FileSignature className='mr-2 size-4' />{" "}
                                Generar Contrato
                              </ContextMenuItem>
                              <ContextMenuSeparator />
                              <ContextMenuItem
                                onClick={() => setContractToDelete(contract)}
                                className='text-red-600 cursor-pointer'>
                                <Trash2 className='mr-2 size-4' /> Eliminar
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
            <div className='flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30'>
              <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                <span>Mostrar</span>
                <Select
                  value={String(table.getState().pagination.pageSize)}
                  onValueChange={(value) => table.setPageSize(Number(value))}>
                  <SelectTrigger className='h-8 w-17.5'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 20, 30, 40, 50].map((pageSize) => (
                      <SelectItem key={pageSize} value={String(pageSize)}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span>filas</span>
              </div>

              <div className='flex items-center gap-4'>
                <span className='flex items-center gap-1 text-sm text-muted-foreground'>
                  Página{" "}
                  <strong className='text-foreground'>
                    {table.getState().pagination.pageIndex + 1}
                  </strong>{" "}
                  de{" "}
                  <strong className='text-foreground'>
                    {table.getPageCount()}
                  </strong>
                </span>
                <div className='flex items-center gap-1'>
                  <button
                    className='h-8 w-8 p-0 flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}>
                    <ChevronsLeft className='h-4 w-4' />
                  </button>
                  <button
                    className='h-8 w-8 p-0 flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}>
                    <ChevronLeft className='h-4 w-4' />
                  </button>
                  <button
                    className='h-8 w-8 p-0 flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}>
                    <ChevronRight className='h-4 w-4' />
                  </button>
                  <button
                    className='h-8 w-8 p-0 flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage()}>
                    <ChevronsRight className='h-4 w-4' />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </ContextMenuTrigger>
        <ContextMenuPopup>
          <ContextMenuGroup>
            <ContextMenuGroupLabel>Acciones</ContextMenuGroupLabel>
            <ContextMenuItem onClick={handleAddNew} className='cursor-pointer'>
              <Plus className='mr-2 size-4' /> Nuevo Contrato
            </ContextMenuItem>
          </ContextMenuGroup>
        </ContextMenuPopup>
      </ContextMenu>

      <ContractFormSheet
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initialData={editingContract}
      />

      <Dialog
        open={!!contractToDelete}
        onOpenChange={(open) => !open && setContractToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar contrato</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar el contrato{" "}
              {contractToDelete?.contratoNumber}? Esta acción no se puede
              deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='gap-3 sm:gap-3 mt-2'>
            <button
              type='button'
              onClick={() => setContractToDelete(null)}
              className='flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors'>
              Cancelar
            </button>
            <button
              type='button'
              onClick={confirmDelete}
              className='flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-(--color-juse-red) hover:brightness-110 rounded-lg transition-all shadow-sm'>
              <Trash2 className='size-4' />
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
