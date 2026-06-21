import React, { createContext, useCallback, useEffect, useState } from 'react';
import type { JuseContract } from '@/types/contract';
import { generateId } from '@/lib/utils';
import { defaultContracts } from '@/data/seed';

const STORAGE_KEY = 'juse-contracts';

interface ContractsContextValue {
  contracts: JuseContract[];
  addContract: (contract: Omit<JuseContract, 'id' | 'createdAt' | 'updatedAt'>) => JuseContract;
  updateContract: (id: string, updates: Partial<JuseContract>) => void;
  deleteContract: (id: string) => void;
  getContract: (id: string) => JuseContract | undefined;
}

export const ContractsContext = createContext<ContractsContextValue | null>(null);

function loadContracts(): JuseContract[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultContracts));
      return defaultContracts;
    }
    return JSON.parse(raw) as JuseContract[];
  } catch {
    return defaultContracts;
  }
}

function saveContracts(contracts: JuseContract[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contracts));
}

export function generateContractNumber(contracts: JuseContract[], year: number): string {
  const prefix = `${year}-`;
  const contractsOfYear = contracts.filter((c) => c.contratoNumber?.startsWith(prefix));
  
  if (contractsOfYear.length === 0) {
    return `${prefix}001`;
  }

  const maxNumber = contractsOfYear.reduce((max, c) => {
    const parts = c.contratoNumber.split('-');
    if (parts.length === 2) {
      const num = parseInt(parts[1], 10);
      if (!isNaN(num) && num > max) {
        return num;
      }
    }
    return max;
  }, 0);

  const nextNumber = maxNumber + 1;
  return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
}

export function ContractsProvider({ children }: { children: React.ReactNode }) {
  const [contracts, setContracts] = useState<JuseContract[]>(loadContracts);

  useEffect(() => {
    saveContracts(contracts);
  }, [contracts]);

  const addContract = useCallback((contractData: Omit<JuseContract, 'id' | 'createdAt' | 'updatedAt'>): JuseContract => {
    const newContract: JuseContract = {
      ...contractData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setContracts((prev) => [...prev, newContract]);
    return newContract;
  }, [contracts]);

  const updateContract = useCallback((id: string, updates: Partial<JuseContract>) => {
    setContracts((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        return { ...c, ...updates, updatedAt: new Date().toISOString() };
      })
    );
  }, []);

  const deleteContract = useCallback((id: string) => {
    setContracts((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const getContract = useCallback((id: string) => {
    return contracts.find((c) => c.id === id);
  }, [contracts]);

  return (
    <ContractsContext.Provider value={{ contracts, addContract, updateContract, deleteContract, getContract }}>
      {children}
    </ContractsContext.Provider>
  );
}
