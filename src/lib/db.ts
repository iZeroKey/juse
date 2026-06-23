import type { JuseContract } from "@/types/contract";
import type { JuseEvent } from "@/types/event";
import type { JusePackage } from "@/types/package";
import Database from "@tauri-apps/plugin-sql";
import { loadData } from "./storage";
import { generateId } from "./utils";

let dbInstance: Database | null = null;

export async function getDb(): Promise<Database> {
  if (dbInstance) return dbInstance;

  dbInstance = await Database.load("sqlite:juse.db");
  await initDB(dbInstance);

  return dbInstance;
}

async function initDB(db: Database) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS packages (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      precio REAL NOT NULL,
      nroPaquete TEXT NOT NULL,
      especificaciones TEXT,
      movilidad TEXT,
      tipoEvento TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS contracts (
      id TEXT PRIMARY KEY,
      contratoNumber TEXT NOT NULL,
      fechaEmision TEXT NOT NULL,
      clienteNombre TEXT NOT NULL,
      clienteDni TEXT,
      clienteDireccion TEXT,
      clienteCelular TEXT,
      tipoEvento TEXT,
      fechaEvento TEXT NOT NULL,
      horaEvento TEXT,
      paqueteId TEXT,
      paqueteNombre TEXT,
      paqueteDetalle TEXT,
      movilidad TEXT,
      precio REAL NOT NULL,
      aCuenta REAL NOT NULL,
      saldo REAL NOT NULL,
      formaPago TEXT,
      nombresPapitos TEXT,
      nombreBebe TEXT,
      nombreCumpleanero TEXT,
      informacionAdicional TEXT,
      pagoPersonal REAL,
      tipoComprobante TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      startTime TEXT NOT NULL,
      endTime TEXT NOT NULL,
      duration INTEGER NOT NULL,
      eventType TEXT NOT NULL,
      color TEXT,
      location TEXT NOT NULL,
      tematica TEXT,
      contactoNombre TEXT,
      contactoNumero TEXT,
      animadores TEXT NOT NULL,
      bailarines TEXT NOT NULL,
      dj TEXT NOT NULL,
      staffLucido TEXT NOT NULL,
      staffApoyo TEXT NOT NULL,
      muneco TEXT NOT NULL,
      videoFotografia TEXT NOT NULL,
      payaso TEXT NOT NULL,
      showMagia TEXT NOT NULL,
      totalEvento REAL NOT NULL,
      movilidad REAL NOT NULL,
      adelanto REAL NOT NULL,
      saldo REAL NOT NULL,
      pagoPersonal REAL NOT NULL,
      ganancia REAL NOT NULL,
      observacion TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `);
}

function normalizeDate(val: string): string {
  if (!val) return "";
  if (val.includes("-")) {
    const parts = val.split("-");
    if (parts[0].length === 4) return val;
  }

  if (val.includes("/")) {
    const parts = val.split("/");
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
    }
  }

  return val;
}

export async function migrateFromJSON() {
  const db = await getDb();

  const oldContracts = await loadData<JuseContract[]>(
    "juse-contracts.json",
    [],
  );
  const oldPackages = await loadData<JusePackage[]>("juse-packages.json", []);
  const oldEvents = await loadData<JuseEvent[]>("juse-events.json", []);

  console.log(
    `Migrating ${oldContracts.length} contracts, ${oldPackages.length} packages, and ${oldEvents.length} events...`,
  );

  try {
    await db.execute("DELETE FROM contracts");
    await db.execute("DELETE FROM packages");
    await db.execute("DELETE FROM events");

    for (const pkg of oldPackages) {
      try {
        await db.execute(
          `
          INSERT INTO packages (id, nombre, precio, nroPaquete, especificaciones, movilidad, tipoEvento, createdAt, updatedAt)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `,
          [
            pkg.id || generateId(),
            pkg.nombre || "",
            pkg.precio || 0,
            pkg.nroPaquete || "",
            typeof pkg.especificaciones === "string"
              ? pkg.especificaciones
              : JSON.stringify(pkg.especificaciones || ""),
            pkg.movilidad || "",
            pkg.tipoEvento || "",
            normalizeDate(pkg.createdAt) ||
              new Date().toISOString().split("T")[0],
            normalizeDate(pkg.updatedAt) ||
              new Date().toISOString().split("T")[0],
          ],
        );
      } catch (e) {
        console.error("Failed to migrate package:", pkg, e);
        throw e;
      }
    }

    for (const contract of oldContracts) {
      try {
        await db.execute(
          `
          INSERT INTO contracts (
            id, contratoNumber, fechaEmision, clienteNombre, clienteDni, clienteDireccion, clienteCelular,
            tipoEvento, fechaEvento, horaEvento, paqueteId, paqueteNombre, paqueteDetalle, movilidad,
            precio, aCuenta, saldo, formaPago, nombresPapitos, nombreBebe, nombreCumpleanero, informacionAdicional,
            pagoPersonal, tipoComprobante,
            createdAt, updatedAt
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26
          )
        `,
          [
            contract.id || generateId(),
            contract.contratoNumber || "",
            normalizeDate(contract.fechaEmision) || "",
            contract.clienteNombre || "",
            contract.clienteDni || "",
            contract.clienteDireccion || "",
            contract.clienteCelular || "",
            contract.tipoEvento || "",
            normalizeDate(contract.fechaEvento) || "",
            contract.horaEvento || "",
            contract.paqueteId || null,
            contract.paqueteNombre || "",
            contract.paqueteDetalle || "",
            contract.movilidad || "",
            contract.precio || 0,
            contract.aCuenta || 0,
            contract.saldo || 0,
            contract.formaPago || "",
            contract.nombresPapitos || "",
            contract.nombreBebe || "",
            contract.nombreCumpleanero || "",
            contract.informacionAdicional || "",
            contract.pagoPersonal || 0,
            contract.tipoComprobante || "",
            normalizeDate(contract.createdAt) ||
              new Date().toISOString().split("T")[0],
            normalizeDate(contract.updatedAt) ||
              new Date().toISOString().split("T")[0],
          ],
        );
      } catch (e) {
        console.error("Failed to migrate contract:", contract, e);
        throw e;
      }
    }

    for (const event of oldEvents) {
      try {
        await db.execute(
          `
          INSERT INTO events (
            id, date, startTime, endTime, duration, eventType, color, location,
            tematica, contactoNombre, contactoNumero,
            animadores, bailarines, dj, staffLucido, staffApoyo, muneco, videoFotografia, payaso, showMagia,
            totalEvento, movilidad, adelanto, saldo, pagoPersonal, ganancia, observacion,
            createdAt, updatedAt
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29
          )
        `,
          [
            event.id || generateId(),
            normalizeDate(event.date) || "",
            event.startTime || "",
            event.endTime || "",
            event.duration || 0,
            event.eventType || "",
            event.color || "",
            event.location || "",
            event.tematica || "",
            event.contactoNombre || "",
            event.contactoNumero || "",
            JSON.stringify(event.animadores || []),
            JSON.stringify(event.bailarines || []),
            JSON.stringify(event.dj || []),
            JSON.stringify(event.staffLucido || []),
            JSON.stringify(event.staffApoyo || []),
            JSON.stringify(event.muneco || []),
            JSON.stringify(event.videoFotografia || []),
            JSON.stringify(event.payaso || []),
            JSON.stringify(event.showMagia || []),
            event.totalEvento || 0,
            event.movilidad || 0,
            event.adelanto || 0,
            event.saldo || 0,
            event.pagoPersonal || 0,
            event.ganancia || 0,
            event.observacion || "",
            normalizeDate(event.createdAt) ||
              new Date().toISOString().split("T")[0],
            normalizeDate(event.updatedAt) ||
              new Date().toISOString().split("T")[0],
          ],
        );
      } catch (e) {
        console.error("Failed to migrate event:", event, e);
        throw e;
      }
    }

    console.log("Migration successful!");
    return {
      success: true,
      message: "Migración de JSON a SQLite completada exitosamente.",
    };
  } catch (error) {
    console.error("Migration failed:", error);
    return { success: false, message: String(error) };
  }
}

export async function getContractsFromDB(): Promise<JuseContract[]> {
  try {
    const db = await getDb();
    return await db.select<JuseContract[]>(
      "SELECT * FROM contracts ORDER BY fechaEvento DESC",
    );
  } catch (e) {
    console.error("Error fetching contracts:", e);
    return [];
  }
}

export async function insertContractToDB(contract: JuseContract) {
  const db = await getDb();
  await db.execute(
    `
    INSERT INTO contracts (
      id, contratoNumber, fechaEmision, clienteNombre, clienteDni, clienteDireccion, clienteCelular,
      tipoEvento, fechaEvento, horaEvento, paqueteId, paqueteNombre, paqueteDetalle, movilidad,
      precio, aCuenta, saldo, formaPago, nombresPapitos, nombreBebe, nombreCumpleanero, informacionAdicional,
      pagoPersonal, tipoComprobante,
      createdAt, updatedAt
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26
    )
  `,
    [
      contract.id,
      contract.contratoNumber ?? "",
      normalizeDate(contract.fechaEmision) ?? "",
      contract.clienteNombre ?? "",
      contract.clienteDni ?? "",
      contract.clienteDireccion ?? "",
      contract.clienteCelular ?? "",
      contract.tipoEvento ?? "",
      normalizeDate(contract.fechaEvento) ?? "",
      contract.horaEvento ?? "",
      contract.paqueteId ?? null,
      contract.paqueteNombre ?? "",
      contract.paqueteDetalle ?? "",
      contract.movilidad ?? "",
      contract.precio ?? 0,
      contract.aCuenta ?? 0,
      contract.saldo ?? 0,
      contract.formaPago ?? "",
      contract.nombresPapitos ?? "",
      contract.nombreBebe ?? "",
      contract.nombreCumpleanero ?? "",
      contract.informacionAdicional ?? "",
      contract.pagoPersonal ?? 0,
      contract.tipoComprobante ?? "",
      normalizeDate(contract.createdAt) ?? "",
      normalizeDate(contract.updatedAt) ?? "",
    ],
  );
}

export async function updateContractInDB(
  id: string,
  contract: Partial<JuseContract>,
) {
  const db = await getDb();

  if (contract.fechaEmision)
    contract.fechaEmision = normalizeDate(contract.fechaEmision);
  if (contract.fechaEvento)
    contract.fechaEvento = normalizeDate(contract.fechaEvento);
  if (contract.createdAt)
    contract.createdAt = normalizeDate(contract.createdAt);
  if (contract.updatedAt)
    contract.updatedAt = normalizeDate(contract.updatedAt);

  const keys = Object.keys(contract).filter(
    (k) => k !== "id" && (contract as Record<string, unknown>)[k] !== undefined,
  );
  if (keys.length === 0) return;

  const setString = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");
  const values = keys.map((k) => {
    const val = (contract as Record<string, unknown>)[k];
    return val ?? null;
  });
  values.push(id);

  await db.execute(
    `UPDATE contracts SET ${setString} WHERE id = $${keys.length + 1}`,
    values,
  );
}

export async function deleteContractFromDB(id: string) {
  const db = await getDb();
  await db.execute(`DELETE FROM contracts WHERE id = $1`, [id]);
}

export async function getPackagesFromDB(): Promise<JusePackage[]> {
  try {
    const db = await getDb();
    return await db.select<JusePackage[]>(
      "SELECT * FROM packages ORDER BY nroPaquete DESC",
    );
  } catch (e) {
    console.error("Error fetching packages:", e);
    return [];
  }
}

export async function insertPackageToDB(pkg: JusePackage) {
  const db = await getDb();
  await db.execute(
    `
    INSERT INTO packages (id, nombre, precio, nroPaquete, especificaciones, movilidad, tipoEvento, createdAt, updatedAt)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  `,
    [
      pkg.id,
      "",
      pkg.precio ?? 0,
      pkg.nroPaquete ?? "",
      typeof pkg.especificaciones === "string"
        ? pkg.especificaciones
        : JSON.stringify(pkg.especificaciones || ""),
      pkg.movilidad ?? "",
      pkg.tipoEvento ?? "",
      normalizeDate(pkg.createdAt),
      normalizeDate(pkg.updatedAt),
    ],
  );
}

export async function updatePackageInDB(id: string, pkg: Partial<JusePackage>) {
  const db = await getDb();

  if (pkg.createdAt) pkg.createdAt = normalizeDate(pkg.createdAt);
  if (pkg.updatedAt) pkg.updatedAt = normalizeDate(pkg.updatedAt);

  const keys = Object.keys(pkg).filter(
    (k) => k !== "id" && (pkg as Record<string, unknown>)[k] !== undefined,
  );
  if (keys.length === 0) return;

  const setString = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");
  const values = keys.map((k) => {
    const val = (pkg as Record<string, unknown>)[k];
    if (k === "especificaciones" && typeof val !== "string")
      return JSON.stringify(val || "");
    return val ?? null;
  });
  values.push(id);

  await db.execute(
    `UPDATE packages SET ${setString} WHERE id = $${keys.length + 1}`,
    values,
  );
}

export async function deletePackageFromDB(id: string) {
  const db = await getDb();
  await db.execute(`DELETE FROM packages WHERE id = $1`, [id]);
}

export async function getEventsFromDB(): Promise<JuseEvent[]> {
  const db = await getDb();

  let rawEvents: Record<string, unknown>[];
  try {
    rawEvents = await db.select<Record<string, unknown>[]>(
      "SELECT * FROM events ORDER BY date DESC, startTime DESC",
    );
  } catch (e) {
    console.error("Error fetching events:", e);

    return [];
  }

  return rawEvents.map((e) => ({
    ...e,
    animadores: JSON.parse(String(e.animadores || "[]")),
    bailarines: JSON.parse(String(e.bailarines || "[]")),
    dj: JSON.parse(String(e.dj || "[]")),
    staffLucido: JSON.parse(String(e.staffLucido || "[]")),
    staffApoyo: JSON.parse(String(e.staffApoyo || "[]")),
    muneco: JSON.parse(String(e.muneco || "[]")),
    videoFotografia: JSON.parse(String(e.videoFotografia || "[]")),
    payaso: JSON.parse(String(e.payaso || "[]")),
    showMagia: JSON.parse(String(e.showMagia || "[]")),
  })) as unknown as JuseEvent[];
}

export async function insertEventToDB(event: JuseEvent) {
  const db = await getDb();
  await db.execute(
    `
    INSERT INTO events (
      id, date, startTime, endTime, duration, eventType, color, location,
      tematica, contactoNombre, contactoNumero,
      animadores, bailarines, dj, staffLucido, staffApoyo, muneco, videoFotografia, payaso, showMagia,
      totalEvento, movilidad, adelanto, saldo, pagoPersonal, ganancia, observacion,
      createdAt, updatedAt
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29
    )
  `,
    [
      event.id,
      normalizeDate(event.date) ?? "",
      event.startTime ?? "",
      event.endTime ?? "",
      event.duration ?? 0,
      event.eventType ?? "",
      event.color ?? "",
      event.location ?? "",
      event.tematica ?? "",
      event.contactoNombre ?? "",
      event.contactoNumero ?? "",
      JSON.stringify(event.animadores || []),
      JSON.stringify(event.bailarines || []),
      JSON.stringify(event.dj || []),
      JSON.stringify(event.staffLucido || []),
      JSON.stringify(event.staffApoyo || []),
      JSON.stringify(event.muneco || []),
      JSON.stringify(event.videoFotografia || []),
      JSON.stringify(event.payaso || []),
      JSON.stringify(event.showMagia || []),
      event.totalEvento ?? 0,
      event.movilidad ?? 0,
      event.adelanto ?? 0,
      event.saldo ?? 0,
      event.pagoPersonal ?? 0,
      event.ganancia ?? 0,
      event.observacion ?? "",
      normalizeDate(event.createdAt),
      normalizeDate(event.updatedAt),
    ],
  );
}

export async function updateEventInDB(id: string, event: Partial<JuseEvent>) {
  const db = await getDb();

  if (event.date) event.date = normalizeDate(event.date);
  if (event.createdAt) event.createdAt = normalizeDate(event.createdAt);
  if (event.updatedAt) event.updatedAt = normalizeDate(event.updatedAt);

  const keys = Object.keys(event).filter(
    (k) => k !== "id" && (event as Record<string, unknown>)[k] !== undefined,
  );
  if (keys.length === 0) return;

  const setString = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");
  const values = keys.map((k) => {
    const val = (event as Record<string, unknown>)[k];
    if (Array.isArray(val)) return JSON.stringify(val);
    return val ?? null;
  });
  values.push(id);

  await db.execute(
    `UPDATE events SET ${setString} WHERE id = $${keys.length + 1}`,
    values,
  );
}

export async function deleteEventFromDB(id: string) {
  const db = await getDb();
  await db.execute(`DELETE FROM events WHERE id = $1`, [id]);
}
