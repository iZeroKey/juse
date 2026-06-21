import { useContext } from 'react';
import { PackagesContext } from '@/context/packages-context';

export function usePackages() {
  const context = useContext(PackagesContext);
  if (!context) {
    throw new Error('usePackages must be used within a PackagesProvider');
  }
  return context;
}
