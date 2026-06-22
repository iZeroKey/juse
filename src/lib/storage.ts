import {
  BaseDirectory,
  exists,
  mkdir,
  readTextFile,
  writeTextFile,
} from "@tauri-apps/plugin-fs";

export async function loadData<T>(
  filename: string,
  defaultData: T,
): Promise<T> {
  if (typeof window === "undefined" || !("__TAURI_INTERNALS__" in window)) {
    try {
      const data = localStorage.getItem(filename);
      return data ? JSON.parse(data) : defaultData;
    } catch {
      return defaultData;
    }
  }

  try {
    const hasDataDir = await exists("", { baseDir: BaseDirectory.AppData });
    if (!hasDataDir) {
      await mkdir("", { baseDir: BaseDirectory.AppData });
    }
    const hasFile = await exists(filename, { baseDir: BaseDirectory.AppData });
    if (!hasFile) {
      await writeTextFile(filename, JSON.stringify(defaultData, null, 2), {
        baseDir: BaseDirectory.AppData,
      });
      return defaultData;
    }
    const content = await readTextFile(filename, {
      baseDir: BaseDirectory.AppData,
    });
    return JSON.parse(content);
  } catch (e) {
    console.error(`Failed to load data from ${filename}`, e);

    try {
      const fallback = localStorage.getItem(filename);
      return fallback ? JSON.parse(fallback) : defaultData;
    } catch {
      return defaultData;
    }
  }
}

export async function saveData<T>(filename: string, data: T): Promise<void> {
  if (typeof window === "undefined" || !("__TAURI_INTERNALS__" in window)) {
    localStorage.setItem(filename, JSON.stringify(data));
    return;
  }
  try {
    const hasDataDir = await exists("", { baseDir: BaseDirectory.AppData });
    if (!hasDataDir) {
      await mkdir("", { baseDir: BaseDirectory.AppData });
    }
    await writeTextFile(filename, JSON.stringify(data, null, 2), {
      baseDir: BaseDirectory.AppData,
    });
  } catch (e) {
    console.error(`Failed to save data to ${filename}`, e);
  }
}
