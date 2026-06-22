import { getContractsFromDB, insertContractToDB } from './db';
import { getPackagesFromDB, insertPackageToDB } from './db';
import { getEventsFromDB, insertEventToDB } from './db';
import { generateId } from './utils';

import { save, open } from '@tauri-apps/plugin-dialog';
import { writeTextFile, readTextFile } from '@tauri-apps/plugin-fs';

export type TableName = 'contracts' | 'packages' | 'events';

export interface ExportData {
  table: TableName;
  data: any[];
}

export async function exportDataToJSON(table: TableName) {
  let rawData: any[] = [];
  
  if (table === 'contracts') {
    rawData = await getContractsFromDB();
  } else if (table === 'packages') {
    rawData = await getPackagesFromDB();
  } else if (table === 'events') {
    rawData = await getEventsFromDB();
  }
  
  const cleanedData = rawData.map(item => {
    const { id, createdAt, updatedAt, ...rest } = item;
    return rest;
  });
  
  const payload: ExportData = {
    table,
    data: cleanedData
  };
  
  const jsonString = JSON.stringify(payload, null, 2);
  
  const filePath = await save({
    title: `Exportar datos de ${table}`,
    filters: [{
      name: 'JSON',
      extensions: ['json']
    }],
    defaultPath: `juse_${table}_export.json`
  });
  
  if (filePath) {
    await writeTextFile(filePath, jsonString);
    return { success: true, path: filePath };
  }
  
  return { success: false };
}

export async function parseImportFile(): Promise<{ success: boolean, payload?: ExportData, message?: string }> {
  const filePath = await open({
    title: 'Importar datos',
    multiple: false,
    filters: [{
      name: 'JSON',
      extensions: ['json']
    }]
  });
  
  if (!filePath || Array.isArray(filePath)) {
    return { success: false, message: 'Operación cancelada.' };
  }
  
  try {
    const content = await readTextFile(filePath);
    const payload = JSON.parse(content) as ExportData;
    
    if (!payload.table || !payload.data || !Array.isArray(payload.data)) {
      throw new Error("El archivo no tiene el formato correcto.");
    }
    
    return { success: true, payload };
  } catch (error) {
    console.error("Parse failed:", error);
    return { success: false, message: `Error al leer el archivo: ${String(error)}` };
  }
}

export async function executeImport(payload: ExportData, mode: 'replace' | 'append'): Promise<{ success: boolean, message: string }> {
  try {
    const { table, data } = payload;
    
    if (mode === 'replace') {
       const { getDb } = await import('./db');
       const db = await getDb();
       await db.execute(`DELETE FROM ${table}`);
    }
    
    const now = new Date().toISOString().split('T')[0];
    
    for (const item of data) {
      const newItem = {
        ...item,
        id: generateId(),
        createdAt: now,
        updatedAt: now
      };
      
      if (table === 'contracts') {
        await insertContractToDB(newItem as any);
      } else if (table === 'packages') {
        await insertPackageToDB(newItem as any);
      } else if (table === 'events') {
        await insertEventToDB(newItem as any);
      }
    }
    
    const TABLE_NAMES_ES: Record<TableName, string> = {
      contracts: 'Contratos',
      packages: 'Paquetes',
      events: 'Eventos'
    };
    
    return { success: true, message: `Se importaron ${data.length} registros en ${TABLE_NAMES_ES[table] || table}.` };
  } catch (error) {
    console.error("Import failed:", error);
    return { success: false, message: `Error al importar: ${String(error)}` };
  }
}
