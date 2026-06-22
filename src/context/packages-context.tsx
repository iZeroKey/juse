import React, { createContext, useCallback, useEffect, useState } from 'react';
import type { JusePackage } from '@/types/package';
import { generateId } from '@/lib/utils';
import { loadData, saveData } from '@/lib/storage';

const STORAGE_KEY = 'juse-packages.json';

interface PackagesContextValue {
  packages: JusePackage[];
  addPackage: (pkg: Omit<JusePackage, 'id' | 'createdAt' | 'updatedAt'>) => JusePackage;
  updatePackage: (id: string, updates: Partial<JusePackage>) => void;
  deletePackage: (id: string) => void;
  getPackage: (id: string) => JusePackage | undefined;
  isLoaded: boolean;
}

export const PackagesContext = createContext<PackagesContextValue | null>(null);

// Migration function removed since specifications are now plain strings

export function PackagesProvider({ children }: { children: React.ReactNode }) {
  const [packages, setPackages] = useState<JusePackage[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadData<JusePackage[]>(STORAGE_KEY, []).then(data => {
      setPackages(data);
      setIsLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveData(STORAGE_KEY, packages);
    }
  }, [packages, isLoaded]);

  const addPackage = useCallback((pkgData: Omit<JusePackage, 'id' | 'createdAt' | 'updatedAt'>): JusePackage => {
    const newPkg: JusePackage = {
      ...pkgData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setPackages((prev) => [...prev, newPkg]);
    return newPkg;
  }, []);

  const updatePackage = useCallback((id: string, updates: Partial<JusePackage>) => {
    setPackages((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        return { ...p, ...updates, updatedAt: new Date().toISOString() };
      })
    );
  }, []);

  const deletePackage = useCallback((id: string) => {
    setPackages((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const getPackage = useCallback((id: string) => {
    return packages.find((p) => p.id === id);
  }, [packages]);

  return (
    <PackagesContext.Provider value={{ packages, addPackage, updatePackage, deletePackage, getPackage, isLoaded }}>
      {isLoaded ? children : null}
    </PackagesContext.Provider>
  );
}
