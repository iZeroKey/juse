import { User, Phone, MapPin, IdCard } from 'lucide-react';
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
import type { JuseContract } from '@/types/contract';

interface ContractClientSheetProps {
  open: boolean;
  onClose: () => void;
  contract?: JuseContract;
}

export function ContractClientSheet({ open, onClose, contract }: ContractClientSheetProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

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
                    <User className="size-4 text-[var(--color-juse-blue)]" />
                    Datos del Cliente
                  </DrawerTitle>
                  <DrawerDescription>
                    Información de contacto y detalles
                  </DrawerDescription>
                </div>
              </div>
            </DrawerHeader>

            <DrawerPanel>
              <div className="space-y-6">
                <section className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Información Personal
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Nombre Completo</span>
                      <p className="text-base font-medium text-foreground">{contract.clienteNombre}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-muted-foreground flex items-center gap-1"><IdCard className="size-3.5"/> DNI</span>
                        <p className="text-sm font-medium text-foreground">{contract.clienteDni || '-'}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground flex items-center gap-1"><Phone className="size-3.5"/> Celular</span>
                        <p className="text-sm font-medium text-foreground">{contract.clienteCelular || '-'}</p>
                      </div>
                    </div>
                  </div>
                </section>

                <Separator />

                <section className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Ubicación
                  </h3>
                  <div>
                    <span className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="size-3.5"/> Dirección</span>
                    <p className="text-sm font-medium text-foreground">{contract.clienteDireccion || '-'}</p>
                  </div>
                </section>
              </div>
            </DrawerPanel>
          </>
        )}
      </DrawerPopup>
    </Drawer>
  );
}
