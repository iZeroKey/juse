import { Calendar as CalendarIcon, Clock, Package, Users } from 'lucide-react';
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

function FinanceRow({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <>
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={cn('text-sm font-medium text-right tabular-nums', className)}>
        {value}
      </span>
    </>
  );
}

interface ContractEventSheetProps {
  open: boolean;
  onClose: () => void;
  contract?: JuseContract;
}

export function ContractEventSheet({ open, onClose, contract }: ContractEventSheetProps) {
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
                    <CalendarIcon className="size-4 text-[var(--color-juse-blue)]" />
                    {contract.tipoEvento}
                  </DrawerTitle>
                  <DrawerDescription>
                    Detalles del paquete y el evento
                  </DrawerDescription>
                </div>
              </div>
            </DrawerHeader>

            <DrawerPanel>
              <div className="space-y-6">
                
                {/* ── Información General ─────────────── */}
                <section className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Información del Evento
                  </h3>

                  <div className="space-y-2.5">
                    <div className="flex items-center gap-3">
                      <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
                      <span className="text-sm capitalize">
                        {contract.fechaEvento ? format(parseISO(contract.fechaEvento), "EEEE d 'de' MMMM, yyyy", { locale: es }) : '-'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock className="size-4 shrink-0 text-muted-foreground" />
                      <span className="text-sm">
                        {contract.horaEvento || '-'}
                      </span>
                    </div>
                  </div>
                </section>

                <Separator />

                {/* ── Festejados ───────────────────────────── */}
                {(contract.nombreCumpleanero || contract.nombreBebe || contract.nombresPapitos) && (
                  <>
                    <section className="space-y-3">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <Users className="size-3.5" /> Festejados
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        {contract.nombreCumpleanero && (
                          <div>
                            <span className="text-sm text-muted-foreground">Cumpleañero/a</span>
                            <p className="text-sm font-medium text-foreground">{contract.nombreCumpleanero}</p>
                          </div>
                        )}
                        {contract.nombresPapitos && (
                          <div>
                            <span className="text-sm text-muted-foreground">Papitos</span>
                            <p className="text-sm font-medium text-foreground">{contract.nombresPapitos}</p>
                          </div>
                        )}
                        {contract.nombreBebe && (
                          <div>
                            <span className="text-sm text-muted-foreground">Bebé</span>
                            <p className="text-sm font-medium text-foreground">{contract.nombreBebe}</p>
                          </div>
                        )}
                      </div>
                    </section>
                    <Separator />
                  </>
                )}

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
                  
                  <div className="space-y-4">
                    <div className="rounded-lg bg-muted p-3">
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
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Finanzas
                  </h3>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <FinanceRow
                      label="Precio del Paquete"
                      value={formatCurrency(contract.precio)}
                      className="text-base font-semibold"
                    />
                    <FinanceRow
                      label="A Cuenta"
                      value={formatCurrency(contract.aCuenta)}
                    />
                    <FinanceRow
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
                    <div className="mt-3 flex items-center justify-between py-1 border-t border-border pt-2">
                      <span className="text-sm text-muted-foreground">Forma de Pago</span>
                      <span className="text-sm font-medium text-right uppercase bg-muted px-2 py-0.5 rounded-md text-foreground">{contract.formaPago}</span>
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
