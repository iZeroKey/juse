import { useEffect, useState } from 'react';
import { Minus, Square, X } from 'lucide-react';
import { getCurrentWindow } from '@tauri-apps/api/window';

export function TitleBar() {
  const [isWindowMaximized, setIsWindowMaximized] = useState(false);
  const [isTauri, setIsTauri] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.__TAURI_INTERNALS__) {
      setIsTauri(true);
      const appWindow = getCurrentWindow();
      appWindow.isMaximized().then(setIsWindowMaximized);
      
      const unlisten = appWindow.onResized(() => {
        appWindow.isMaximized().then(setIsWindowMaximized);
      });
      
      return () => {
        unlisten.then(f => f());
      };
    }
  }, []);

  if (!isTauri) return null;

  return (
    <div
      className="h-10 bg-background flex select-none items-center justify-between border-b border-border z-[9999] shrink-0"
    >
      <div 
        data-tauri-drag-region 
        className="pl-4 text-sm font-semibold text-foreground flex items-center gap-2 flex-1 h-full cursor-default"
        onMouseDown={(e) => {
          if (e.buttons === 1) {
            e.preventDefault();
            e.detail === 2
              ? getCurrentWindow().toggleMaximize()
              : getCurrentWindow().startDragging();
          }
        }}
      >
        <span className="pointer-events-none">juse</span>
      </div>
      <div className="flex h-full">
        <button
          onClick={() => getCurrentWindow().minimize()}
          className="inline-flex items-center justify-center h-full w-12 hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Minus strokeWidth={1.5} className="h-4 w-4" />
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
          className="inline-flex items-center justify-center h-full w-12 hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
        >
          {isWindowMaximized ? (
            <div className="relative w-[14px] h-[14px]">
              <Square strokeWidth={1.5} className="h-[10px] w-[10px] absolute top-0 right-0" />
              <Square strokeWidth={1.5} className="h-[10px] w-[10px] absolute bottom-0 left-0 bg-background" />
            </div>
          ) : (
            <Square strokeWidth={1.5} className="h-3.5 w-3.5" />
          )}
        </button>
        <button
          onClick={() => getCurrentWindow().close()}
          className="inline-flex items-center justify-center h-full w-12 hover:bg-red-500 hover:text-white text-muted-foreground transition-colors"
        >
          <X strokeWidth={1.5} className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
