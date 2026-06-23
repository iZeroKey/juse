import {
  Drawer,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerPanel,
  DrawerPopup,
  DrawerTitle,
} from "@/components/ui/drawer";
import { generateEventMessage } from "@/lib/message-template";
import type { JuseEvent } from "@/types/event";
import { Check, Copy } from "lucide-react";
import * as React from "react";

import { useMediaQuery } from "@/hooks/use-media-query";

interface EventMessageDrawerProps {
  event: JuseEvent | null;
  open: boolean;
  onClose: () => void;
}

export function EventMessageDrawer({
  event,
  open,
  onClose,
}: EventMessageDrawerProps) {
  const [message, setMessage] = React.useState("");
  const [copied, setCopied] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [prevEventId, setPrevEventId] = React.useState<string | undefined>(undefined);
  const [prevOpen, setPrevOpen] = React.useState(false);

  if (open !== prevOpen || event?.id !== prevEventId) {
    setPrevOpen(open);
    setPrevEventId(event?.id);
    if (open && event) {
      setMessage(generateEventMessage(event));
      setCopied(false);
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text", err);
    }
  };

  return (
    <Drawer
      open={open}
      position={isDesktop ? "right" : "bottom"}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}>
      <DrawerPopup variant='inset' showBar>
        <DrawerHeader>
          <DrawerTitle className='font-display text-lg'>
            Mensaje del Evento
          </DrawerTitle>
          <DrawerDescription>
            Verifica y edita el mensaje antes de copiarlo. Los cambios no se
            guardarán en el evento.
          </DrawerDescription>
        </DrawerHeader>

        <DrawerPanel>
          <textarea
            className='w-full min-h-75 p-3 rounded-lg border bg-background text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-(--color-juse-blue) field-sizing-content overflow-hidden'
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </DrawerPanel>

        <DrawerFooter
          variant='bare'
          className='shrink-0 flex gap-3 flex-row pt-4 px-4 sm:px-6'>
          <button
            type='button'
            onClick={onClose}
            className='flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors cursor-pointer'>
            Cancelar
          </button>
          <button
            type='button'
            onClick={handleCopy}
            className='flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-(--color-juse-blue) hover:brightness-110 rounded-lg transition-all shadow-sm cursor-pointer'>
            {copied ? (
              <Check className='size-4' />
            ) : (
              <Copy className='size-4' />
            )}
            {copied ? "¡Copiado!" : "Copiar mensaje"}
          </button>
        </DrawerFooter>
      </DrawerPopup>
    </Drawer>
  );
}
