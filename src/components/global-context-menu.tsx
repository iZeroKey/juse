import { useState, useEffect, ReactNode } from "react";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuPopup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuGroup,
  ContextMenuGroupLabel,
} from "@/components/ui/context-menu";
import { Copy, Scissors, Clipboard, RefreshCw, Palette } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

interface GlobalContextMenuProps {
  children: ReactNode;
}

export function GlobalContextMenu({ children }: GlobalContextMenuProps) {
  const [hasSelection, setHasSelection] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      setHasSelection(!!selection && selection.toString().trim().length > 0);
    };

    const handleFocusChange = () => {
      const activeElement = document.activeElement;
      const isInput = activeElement?.tagName === 'INPUT' || 
                      activeElement?.tagName === 'TEXTAREA' || 
                      activeElement?.getAttribute('contenteditable') === 'true';
      setIsInputFocused(isInput);
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    document.addEventListener("focusin", handleFocusChange);
    document.addEventListener("focusout", handleFocusChange);

    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
      document.removeEventListener("focusin", handleFocusChange);
      document.removeEventListener("focusout", handleFocusChange);
    };
  }, []);

  const handleCopy = async () => {
    const text = window.getSelection()?.toString() || "";
    if (text) {
      try {
        await navigator.clipboard.writeText(text);
      } catch (e) {
        document.execCommand('copy');
      }
    }
  };

  const handleCut = async () => {
    handleCopy();
    if (isInputFocused) {
      document.execCommand('cut');
    }
  };

  const handlePaste = async () => {
    if (isInputFocused && document.activeElement) {
      try {
        const text = await navigator.clipboard.readText();
        document.execCommand('insertText', false, text);
      } catch (e) {
        console.error("Paste failed", e);
      }
    }
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger className="flex-1 flex flex-col h-full w-full">
        {children}
      </ContextMenuTrigger>
      <ContextMenuPopup>
        {hasSelection || isInputFocused ? (
          <ContextMenuGroup>
            <ContextMenuGroupLabel>Texto</ContextMenuGroupLabel>
            <ContextMenuItem onClick={handleCut} disabled={!hasSelection || !isInputFocused} className="cursor-pointer">
              <Scissors className="mr-2 size-4" /> Cortar
            </ContextMenuItem>
            <ContextMenuItem onClick={handleCopy} disabled={!hasSelection} className="cursor-pointer">
              <Copy className="mr-2 size-4" /> Copiar
            </ContextMenuItem>
            <ContextMenuItem onClick={handlePaste} disabled={!isInputFocused} className="cursor-pointer">
              <Clipboard className="mr-2 size-4" /> Pegar
            </ContextMenuItem>
          </ContextMenuGroup>
        ) : (
          <ContextMenuGroup>
            <ContextMenuGroupLabel>Sistema</ContextMenuGroupLabel>
            <ContextMenuItem onClick={handleReload} className="cursor-pointer">
              <RefreshCw className="mr-2 size-4" /> Recargar interfaz
            </ContextMenuItem>
            <ContextMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="cursor-pointer">
              <Palette className="mr-2 size-4" /> Cambiar Tema
            </ContextMenuItem>
          </ContextMenuGroup>
        )}
      </ContextMenuPopup>
    </ContextMenu>
  );
}
