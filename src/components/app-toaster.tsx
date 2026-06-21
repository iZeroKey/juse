import { Toaster } from 'sileo';
import { useTheme } from '@/components/theme-provider';

export function AppToaster() {
  const { theme } = useTheme();

  return (
    <Toaster 
      position="top-right" 
      offset={{ top: 48, right: 16 }} 
      theme={theme === 'system' ? undefined : theme} 
    />
  );
}
