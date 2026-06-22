import React, { createContext, useCallback, useEffect, useState } from 'react';
import type { JusePackage } from '@/types/package';
import { generateId } from '@/lib/utils';
import {
  getPackagesFromDB,
  insertPackageToDB,
  updatePackageInDB,
  deletePackageFromDB
} from '@/lib/db';

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
    getPackagesFromDB().then(data => {
      setPackages(data);
      setIsLoaded(true);
    }).catch(err => {
      console.error("Failed to load packages from SQLite", err);
      setIsLoaded(true);
    });
  }, []);

  const addPackage = useCallback((pkgData: Omit<JusePackage, 'id' | 'createdAt' | 'updatedAt'>): JusePackage => {
    const newPkg: JusePackage = {
      ...pkgData,
      id: generateId(),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    
    setPackages((prev) => [newPkg, ...prev]);
    insertPackageToDB(newPkg).catch(console.error);
    
    return newPkg;
  }, []);

  const updatePackage = useCallback((id: string, updates: Partial<JusePackage>) => {
    const updatedWithTime = { ...updates, updatedAt: new Date().toISOString().split('T')[0] };
    
    setPackages((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        return { ...p, ...updatedWithTime };
      })
    );
    
    updatePackageInDB(id, updatedWithTime).catch(console.error);
  }, []);

  const deletePackage = useCallback((id: string) => {
    setPackages((prev) => prev.filter((p) => p.id !== id));
    deletePackageFromDB(id).catch(console.error);
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
