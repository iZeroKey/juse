import React, { createContext, useCallback, useEffect, useState } from 'react';
import type { JusePackage } from '@/types/package';
import { generateId } from '@/lib/utils';
import { defaultPackages } from '@/data/seed';

const STORAGE_KEY = 'juse-packages';

interface PackagesContextValue {
  packages: JusePackage[];
  addPackage: (pkg: Omit<JusePackage, 'id' | 'createdAt' | 'updatedAt'>) => JusePackage;
  updatePackage: (id: string, updates: Partial<JusePackage>) => void;
  deletePackage: (id: string) => void;
  getPackage: (id: string) => JusePackage | undefined;
}

export const PackagesContext = createContext<PackagesContextValue | null>(null);

function loadPackages(): JusePackage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultPackages));
      return defaultPackages;
    }
    const parsed = JSON.parse(raw) as any[];
    return parsed.map(pkg => {
      let migratedSpecs: any[] = [];
      
      const rawArray = Array.isArray(pkg.especificaciones) 
        ? pkg.especificaciones 
        : (typeof pkg.especificaciones === 'string' ? pkg.especificaciones.split(' / ').map((s: string) => s.trim()).filter(Boolean) : []);

      migratedSpecs = rawArray.flatMap((item: any) => {
        if (typeof item === 'object' && item !== null && 'value' in item) {
          return item; // Already modern
        }
        const str = String(item);
        if (str.includes('---')) {
          const parts = str.split('---').map(p => p.trim()).filter(Boolean);
          const result = [];
          if (parts.length > 0) {
            if (str.startsWith('---')) {
              result.push({ value: parts[0], isSpecial: true });
            } else {
              result.push({ value: parts[0], isSpecial: false });
              if (parts[1]) result.push({ value: parts[1], isSpecial: true });
            }
          }
          return result;
        }
        return { value: str, isSpecial: false };
      });

      return {
        ...pkg,
        especificaciones: migratedSpecs
      };
    }) as JusePackage[];
  } catch {
    return defaultPackages;
  }
}

function savePackages(packages: JusePackage[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(packages));
}

export function PackagesProvider({ children }: { children: React.ReactNode }) {
  const [packages, setPackages] = useState<JusePackage[]>(loadPackages);

  useEffect(() => {
    savePackages(packages);
  }, [packages]);

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
    <PackagesContext.Provider value={{ packages, addPackage, updatePackage, deletePackage, getPackage }}>
      {children}
    </PackagesContext.Provider>
  );
}
