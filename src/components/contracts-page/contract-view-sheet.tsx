import { 
  FileText, User, MapPin, Calendar,
  Package, DollarSign
} from 'lucide-react';
import {
  Drawer,
  DrawerDescription,
  DrawerHeader,
  DrawerPanel,
  DrawerPopup,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Separator } from '@/components/ui/separator';
import { useMediaQuery } from '@/hooks/use-media-query';
import { usePackages } from '@/hooks/use-packages';
import type { JuseContract } from '@/types/contract';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn, formatCurrency } from '@/lib/utils';

function DataRow({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <>
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={cn('text-sm font-medium text-right', className)}>
        {value || '-'}
      </span>
    </>
  );
}

interface ContractViewSheetProps {
  open: boolean;
  onClose: () => void;
  contract?: JuseContract;
}

export function ContractViewSheet({ open, onClose, contract }: ContractViewSheetProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const { packages } = usePackages();

  const packageInfo = contract ? packages.find((p) => p.id === contract.paqueteId) : null;

  return (
    <Drawer
      open={open}
      onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}
      position={isDesktop ? 'right' : 'bottom'}
    >
      <DrawerPopup variant="inset" showBar>
        {contract && (
          <>
            <DrawerHeader>
              <div className="flex items-start gap-3 pr-8">
                <div className="flex-1 space-y-1">
                  <DrawerTitle className="font-display text-lg flex items-center gap-2">
                    <FileText className="size-4 text-[var(--color-juse-blue)]" />
                    Contrato {contract.contratoNumber}
                  </DrawerTitle>
                  <DrawerDescription>
                    Resumen completo del contrato registrado
                  </DrawerDescription>
                </div>
              </div>
            </DrawerHeader>

            <DrawerPanel>
              <div className="space-y-6">
                
                {/* ── Cliente y Ubicación ─────────────── */}
                <section className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <User className="size-3.5" /> Cliente
                  </h3>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      <DataRow label="Nombre" value={contract.clienteNombre} />
                      <DataRow label="DNI" value={contract.clienteDni} />
                      <DataRow label="Celular" value={contract.clienteCelular} />
                    </div>
                    
                    <div className="mt-2 rounded-lg bg-slate-50 p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="size-3.5 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground">Dirección</span>
                      </div>
                      <p className="text-sm text-foreground">
                        {contract.clienteDireccion || 'Sin dirección registrada'}
                      </p>
                    </div>
                  </div>
                </section>

                <Separator />

                {/* ── Información del Evento ─────────────── */}
                <section className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Calendar className="size-3.5" /> Evento
                  </h3>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <DataRow label="Tipo" value={<span className="uppercase">{contract.tipoEvento}</span>} />
                    <DataRow 
                      label="Fecha" 
                      value={contract.fechaEvento ? format(parseISO(contract.fechaEvento), "dd MMM yyyy", { locale: es }) : '-'} 
                      className="capitalize"
                    />
                    <DataRow label="Hora" value={contract.horaEvento} />
                  </div>
                </section>

                {/* ── Festejados e Info (Opcional) ─────────────── */}
                {(contract.nombreCumpleanero || contract.nombreBebe || contract.nombresPapitos || contract.informacionAdicional) && (
                  <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
                    {contract.nombreCumpleanero && <DataRow label="Cumpleañero/a" value={contract.nombreCumpleanero} />}
                    {contract.nombresPapitos && <DataRow label="Papitos" value={contract.nombresPapitos} />}
                    {contract.nombreBebe && <DataRow label="Bebé" value={contract.nombreBebe} />}
                    {contract.informacionAdicional && (
                      <div className="col-span-2 mt-1">
                        <DataRow label="Info Adicional" value={<span className="whitespace-pre-wrap">{contract.informacionAdicional}</span>} />
                      </div>
                    )}
                  </div>
                )}

                <Separator />

                {/* ── Paquete ────────────────────────── */}
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Package className="size-3.5" /> Paquete
                    </h3>
                    {packageInfo && (
                      <span className="text-xs font-medium text-[var(--color-juse-blue)] bg-blue-50 px-2 py-0.5 rounded-full">
                        {packageInfo.nroPaquete}
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                        {contract.paqueteDetalle || <span className="italic text-muted-foreground">Sin detalles registrados.</span>}
                      </p>
                    </div>

                    {contract.movilidad && (
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-muted-foreground">Movilidad</span>
                        <span className="text-sm font-medium text-right">{contract.movilidad}</span>
                      </div>
                    )}
                  </div>
                </section>

                <Separator />

                {/* ── Finanzas ────────────────────────── */}
                <section className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <DollarSign className="size-3.5" /> Finanzas
                  </h3>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <DataRow
                      label="Precio Total"
                      value={formatCurrency(contract.precio)}
                      className="text-base font-semibold"
                    />
                    <DataRow
                      label="A Cuenta"
                      value={formatCurrency(contract.aCuenta)}
                    />
                    <DataRow
                      label="Saldo"
                      value={formatCurrency(contract.saldo)}
                      className={cn(
                        contract.saldo > 0
                          ? 'text-red-600 font-semibold'
                          : 'text-emerald-600 font-semibold'
                      )}
                    />
                  </div>
                  
                  {contract.formaPago && (
                    <div className="mt-3 flex items-center justify-between py-1 border-t border-slate-100 pt-2">
                      <span className="text-sm text-muted-foreground">Forma de Pago</span>
                      <span className="text-sm font-medium text-right uppercase bg-slate-100 px-2 py-0.5 rounded-md text-slate-700">{contract.formaPago}</span>
                    </div>
                  )}
                </section>
              </div>
            </DrawerPanel>
          </>
        )}
      </DrawerPopup>
    </Drawer>
  );
}
