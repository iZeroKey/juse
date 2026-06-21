import {
  ContextMenu,
  ContextMenuGroup,
  ContextMenuGroupLabel,
  ContextMenuItem,
  ContextMenuPopup,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, RefreshCw, Square, X } from "lucide-react";
import { useEffect, useState } from "react";

export function TitleBar() {
  const [isWindowMaximized, setIsWindowMaximized] = useState(false);
  const [isTauri, setIsTauri] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.__TAURI_INTERNALS__) {
      setIsTauri(true);
      const appWindow = getCurrentWindow();
      appWindow.isMaximized().then(setIsWindowMaximized);

      const unlisten = appWindow.onResized(() => {
        appWindow.isMaximized().then(setIsWindowMaximized);
      });

      return () => {
        unlisten.then((f) => f());
      };
    }
  }, []);

  if (!isTauri) return null;

  return (
    <ContextMenu>
      <ContextMenuTrigger className='w-full pointer-events-auto'>
        <div
          id='titlebar'
          className='pointer-events-auto relative h-10 bg-background flex select-none items-center justify-between z-[10000] shrink-0'
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}>
          {/* Decorative bottom border that doesn't overlap the window control buttons */}
          <div className='absolute bottom-0 left-0 right-[144px] h-[1px] bg-border pointer-events-none' />
          <div
            data-tauri-drag-region
            className='pl-4 text-sm font-semibold text-foreground flex items-center gap-2 flex-1 h-full cursor-default'
            onMouseDown={(e) => {
              if (e.buttons === 1) {
                e.preventDefault();
                e.detail === 2
                  ? getCurrentWindow().toggleMaximize()
                  : getCurrentWindow().startDragging();
              }
            }}>
            <span className='pointer-events-none'>juse</span>
          </div>
          <div className='flex h-full'>
            <button
              onClick={() => getCurrentWindow().minimize()}
              className='inline-flex items-center justify-center h-full w-12 hover:bg-black/5 active:bg-black/10 dark:hover:bg-white/10 dark:active:bg-white/20 text-muted-foreground hover:text-foreground transition-colors'>
              <svg
                width='10'
                height='10'
                viewBox='0 0 10 10'
                aria-hidden='true'>
                <path
                  d='M 0 5 H 10'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='1'
                  shapeRendering='crispEdges'
                />
              </svg>
            </button>
            <button
              onClick={async () => {
                const win = getCurrentWindow();
                const maximized = await win.isMaximized();
                if (maximized) {
                  await win.unmaximize();
                } else {
                  await win.maximize();
                }
              }}
              className='inline-flex items-center justify-center h-full w-12 hover:bg-black/5 active:bg-black/10 dark:hover:bg-white/10 dark:active:bg-white/20 text-muted-foreground hover:text-foreground transition-colors'>
              {isWindowMaximized ? (
                <svg
                  width='10'
                  height='10'
                  viewBox='0 0 10 10'
                  aria-hidden='true'
                  style={{ shapeRendering: "crispEdges" }}>
                  <path
                    d='M 3 1 H 9 V 7 H 7'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='1'
                  />
                  <path
                    d='M 1 3 H 7 V 9 H 1 Z'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='1'
                  />
                </svg>
              ) : (
                <svg
                  width='10'
                  height='10'
                  viewBox='0 0 10 10'
                  aria-hidden='true'
                  style={{ shapeRendering: "crispEdges" }}>
                  <path
                    d='M 1 1 H 9 V 9 H 1 Z'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='1'
                  />
                </svg>
              )}
            </button>
            <button
              onClick={() => getCurrentWindow().close()}
              className='inline-flex items-center justify-center h-full w-12 hover:bg-red-500 active:bg-red-600 hover:text-white active:text-white text-muted-foreground transition-colors'>
              <svg
                width='10'
                height='10'
                viewBox='0 0 10 10'
                aria-hidden='true'>
                <path
                  d='M 0 0 L 10 10 M 10 0 L 0 10'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='1'
                />
              </svg>
            </button>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuPopup>
        <ContextMenuGroup>
          <ContextMenuGroupLabel>Ventana</ContextMenuGroupLabel>
          <ContextMenuItem
            onClick={() => getCurrentWindow().minimize()}
            className='cursor-pointer'>
            <Minus className='mr-2 size-4' /> Minimizar
          </ContextMenuItem>
          <ContextMenuItem
            onClick={async () => {
              const win = getCurrentWindow();
              const maximized = await win.isMaximized();
              if (maximized) {
                await win.unmaximize();
              } else {
                await win.maximize();
              }
            }}
            className='cursor-pointer'>
            <Square className='mr-2 size-4' />{" "}
            {isWindowMaximized ? "Restaurar" : "Maximizar"}
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            onClick={() => getCurrentWindow().close()}
            variant='destructive'
            className='cursor-pointer text-red-600'>
            <X className='mr-2 size-4' /> Cerrar
          </ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuGroup>
          <ContextMenuGroupLabel>Sistema</ContextMenuGroupLabel>
          <ContextMenuItem
            onClick={() => window.location.reload()}
            className='cursor-pointer'>
            <RefreshCw className='mr-2 size-4' /> Recargar Interfaz
          </ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenuPopup>
    </ContextMenu>
  );
}
