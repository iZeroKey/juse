import React, { createContext, useCallback, useEffect, useState } from 'react';
import type { JuseContract } from '@/types/contract';
import { generateId } from '@/lib/utils';
import {
  getContractsFromDB,
  insertContractToDB,
  updateContractInDB,
  deleteContractFromDB
} from '@/lib/db';

const STORAGE_KEY = 'juse-contracts.json';

interface ContractsContextValue {
  contracts: JuseContract[];
  addContract: (contract: Omit<JuseContract, 'id' | 'createdAt' | 'updatedAt'>) => JuseContract;
  updateContract: (id: string, updates: Partial<JuseContract>) => void;
  deleteContract: (id: string) => void;
  getContract: (id: string) => JuseContract | undefined;
  isLoaded: boolean;
}

export const ContractsContext = createContext<ContractsContextValue | null>(null);

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
  const [contracts, setContracts] = useState<JuseContract[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Initial load from SQLite
    getContractsFromDB().then(data => {
      setContracts(data);
      setIsLoaded(true);
    }).catch(err => {
      console.error("Failed to load contracts from SQLite", err);
      setIsLoaded(true);
    });
  }, []);

  const addContract = useCallback((contractData: Omit<JuseContract, 'id' | 'createdAt' | 'updatedAt'>): JuseContract => {
    const newContract: JuseContract = {
      ...contractData,
      id: generateId(),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    
    // Add to state immediately
    setContracts((prev) => [newContract, ...prev]);
    // Save to SQLite
    insertContractToDB(newContract).catch(err => console.error(err));
    
    return newContract;
  }, []);

  const updateContract = useCallback((id: string, updates: Partial<JuseContract>) => {
    const updatedWithTime = { ...updates, updatedAt: new Date().toISOString().split('T')[0] };
    
    // Update state immediately
    setContracts((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        return { ...c, ...updatedWithTime };
      })
    );
    
    // Save to SQLite
    updateContractInDB(id, updatedWithTime).catch(err => console.error(err));
  }, []);

  const deleteContract = useCallback((id: string) => {
    setContracts((prev) => prev.filter((c) => c.id !== id));
    deleteContractFromDB(id).catch(err => console.error(err));
  }, []);

  const getContract = useCallback((id: string) => {
    return contracts.find((c) => c.id === id);
  }, [contracts]);

  return (
    <ContractsContext.Provider value={{ contracts, addContract, updateContract, deleteContract, getContract, isLoaded }}>
      {isLoaded ? children : null}
    </ContractsContext.Provider>
  );
}
