import { useContext } from 'react';
import { ContractsContext } from '@/context/contracts-context';

export function useContracts() {
  const context = useContext(ContractsContext);
  if (!context) {
    throw new Error('useContracts must be used within a ContractsProvider');
  }
  return context;
}
