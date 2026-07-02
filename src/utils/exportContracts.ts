import { formatFechaCorta, formatHora } from "@/lib/utils";
import type { JuseContract } from "@/types/contract";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { sileo } from "sileo";
import XLSX from "xlsx-js-style";

function getFilenameRange(contracts: JuseContract[]): string {
  if (!contracts || contracts.length === 0) {
    return new Date().toISOString().split("T")[0];
  }

  const validDates = contracts
    .map((c) => {
      if (!c.fechaEmision) return null;
      const parts = c.fechaEmision.split("-");
      if (parts.length === 3) {
        return new Date(`${parts[0]}-${parts[1]}-${parts[2]}T00:00:00`);
      }
      const parts2 = c.fechaEmision.split("/");
      if (parts2.length === 3) {
        return new Date(`${parts2[2]}-${parts2[1]}-${parts2[0]}T00:00:00`);
      }
      return null;
    })
    .filter((d) => d !== null) as Date[];

  if (validDates.length === 0) {
    return new Date().toISOString().split("T")[0];
  }

  validDates.sort((a, b) => a.getTime() - b.getTime());

  const oldest = validDates[0];
  const newest = validDates[validDates.length - 1];

  const formatFilenameDate = (d: Date) => d.toISOString().split("T")[0];

  if (oldest.getTime() === newest.getTime()) {
    return formatFilenameDate(oldest);
  }

  return `${formatFilenameDate(oldest)}_${formatFilenameDate(newest)}`;
}

async function saveFileTauriOrWeb(
  fileBytes: Uint8Array | ArrayBuffer,
  fileName: string,
  mimeType: string,
  title: string,
) {
  if (typeof window !== "undefined" && "__TAURI_INTERNALS__" in window) {
    const { writeFile, mkdir } = await import("@tauri-apps/plugin-fs");
    const { downloadDir, join } = await import("@tauri-apps/api/path");
    const { invoke } = await import("@tauri-apps/api/core");

    try {
      const customPath = localStorage.getItem("downloadPath");
      let juseDir;

      if (customPath) {
        juseDir = customPath;
      } else {
        const baseDir = await downloadDir();
        juseDir = await join(baseDir, "Juse Show");
      }

      await mkdir(juseDir, { recursive: true }).catch(() => {});

      const filePath = await join(juseDir, fileName);
      await writeFile(filePath, new Uint8Array(fileBytes));

      const folderName = juseDir.split(/[\\/]/).pop();
      sileo.success({
        title,
        description: `Carpeta: ${folderName} / ${fileName}`,
        duration: 60000,
        button: {
          title: "Abrir archivo",
          onClick: async () => {
            try {
              await invoke("open_local_file", { path: filePath });
            } catch (e) {
              console.error(e);
            }
          },
        },
      });
    } catch (err) {
      console.error(`Error guardando ${fileName}:`, err);
      sileo.error({
        title: "Error",
        description: "No se pudo guardar el archivo en la ruta destino",
      });
    }
  } else {
    const blob = new Blob([fileBytes as BlobPart], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();

    sileo.success({
      title,
      description: "El archivo se descargó en tu navegador",
      duration: 60000,
      button: {
        title: "Ver archivo",
        onClick: () => {
          window.open(url, "_blank");
        },
      },
    });
  }
}

export const exportContratosExcel = async (contracts: JuseContract[]) => {
  if (!contracts || contracts.length === 0) {
    sileo.error({
      title: "Exportación vacía",
      description: "No hay contratos para exportar.",
    });
    return;
  }

  const parseDate = (val: string) => {
    if (!val) return "";
    if (val.includes("-")) {
      const p = val.split("-");
      return new Date(parseInt(p[0]), parseInt(p[1]) - 1, parseInt(p[2]));
    }
    if (val.includes("/")) {
      const p = val.split("/");
      return new Date(parseInt(p[2]), parseInt(p[1]) - 1, parseInt(p[0]));
    }
    return val;
  };

  const data = contracts.map((c) => ({
    "N° Contrato": c.contratoNumber,
    "Fecha Emisión": parseDate(c.fechaEmision),
    Cliente: c.clienteNombre,
    DNI: c.clienteDni || "-",
    Teléfono: c.clienteCelular || "-",
    Dirección: c.clienteDireccion || "-",
    "Tipo Evento": c.tipoEvento,
    "Fecha Evento": parseDate(c.fechaEvento),
    "Hora Evento": formatHora(c.horaEvento),
    "Paquete ID": c.paqueteId || "-",
    "Paquete Nombre": c.paqueteNombre || "Sin Nombre",
    "Paquete Detalle": c.paqueteDetalle || "-",
    "Movilidad (Detalle)": c.movilidad || "-",
    "Nombres Papitos": c.nombresPapitos || "-",
    "Nombre Bebé": c.nombreBebe || "-",
    "Nombre Cumpleañero": c.nombreCumpleanero || "-",
    "Información Adicional": c.informacionAdicional || "-",
    Observación: c.observacion || "-",
    Precio: c.precio,
    "A Cuenta": c.aCuenta,
    Saldo: c.saldo,
    "Forma Pago": c.formaPago || "-",
    "Pago Personal": c.pagoPersonal || 0,
    "Tipo Comprobante": c.tipoComprobante || "-",
  }));

  const worksheet = XLSX.utils.json_to_sheet(data, { cellDates: true });

  const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      const cell = worksheet[cellAddress];

      if (!cell) continue;

      if (R === 0) {
        cell.s = {
          font: { bold: true, color: { rgb: "FFFFFF" }, sz: 11 },
          fill: { fgColor: { rgb: "2980B9" } },
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: "CCCCCC" } },
            bottom: { style: "thin", color: { rgb: "CCCCCC" } },
            left: { style: "thin", color: { rgb: "CCCCCC" } },
            right: { style: "thin", color: { rgb: "CCCCCC" } },
          },
        };
      } else {
        let zFormat = "";

        if (C === 17 || C === 18 || C === 19 || C === 21) {
          zFormat = '"S/"#,##0.00';
        }

        if (C === 1 || C === 7) {
          zFormat = "dd/mm/yyyy";
        }

        cell.s = {
          alignment: {
            vertical: "center",
            horizontal: "center",
            wrapText: true,
          },
          border: {
            top: { style: "thin", color: { rgb: "E5E7EB" } },
            bottom: { style: "thin", color: { rgb: "E5E7EB" } },
            left: { style: "thin", color: { rgb: "E5E7EB" } },
            right: { style: "thin", color: { rgb: "E5E7EB" } },
          },
        };

        if (zFormat) {
          cell.z = zFormat;
        }
      }
    }
  }

  worksheet["!rows"] = [{ hpt: 25 }];

  const wscols = [
    { wch: 15 },
    { wch: 15 },
    { wch: 30 },
    { wch: 12 },
    { wch: 15 },
    { wch: 40 },
    { wch: 20 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 25 },
    { wch: 150 },
    { wch: 25 },
    { wch: 30 },
    { wch: 20 },
    { wch: 20 },
    { wch: 40 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 18 },
    { wch: 20 },
  ];
  worksheet["!cols"] = wscols;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Contratos");
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

  const dateRange = getFilenameRange(contracts);
  const fileName = `Contratos_${dateRange}.xlsx`;

  await saveFileTauriOrWeb(
    excelBuffer,
    fileName,
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "¡Excel generado!",
  );
};

export const exportContratosPDF = async (contracts: JuseContract[]) => {
  if (!contracts || contracts.length === 0) {
    sileo.error({
      title: "Exportación vacía",
      description: "No hay contratos para exportar.",
    });
    return;
  }

  const doc = new jsPDF({ orientation: "landscape", format: "a3" });

  doc.setFontSize(16);
  doc.text("Reporte Detallado de Contratos", 14, 15);

  const tableColumn = [
    "Contrato",
    "F. Emisión",
    "Cliente",
    "DNI/Teléfono",
    "Dirección",
    "T. Evento",
    "F. Evento / Hora",
    "Paquete / Detalle",
    "Nombres/Bebe",
    "Info Adic.",
    "Observación",
    "Precio",
    "A Cuenta",
    "Saldo",
    "Pago P.",
    "Comprobante",
  ];

  const tableRows = contracts.map((c) => [
    c.contratoNumber,
    formatFechaCorta(c.fechaEmision),
    c.clienteNombre,
    `${c.clienteDni || "-"}\n${c.clienteCelular || "-"}`,
    c.clienteDireccion || "-",
    c.tipoEvento,
    `${formatFechaCorta(c.fechaEvento)}\n${formatHora(c.horaEvento)}`,
    `${c.paqueteNombre || "-"}\n${c.paqueteDetalle || "-"}`,
    `${c.nombresPapitos || "-"}\n${c.nombreBebe || "-"}\n${c.nombreCumpleanero || "-"}`,
    c.informacionAdicional || "-",
    c.observacion || "-",
    `S/ ${c.precio.toFixed(2)}`,
    `S/ ${c.aCuenta.toFixed(2)}`,
    `S/ ${c.saldo.toFixed(2)}`,
    `S/ ${(c.pagoPersonal || 0).toFixed(2)}`,
    `${c.formaPago || "-"}\n${c.tipoComprobante || "-"}`,
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 20,
    theme: "grid",
    styles: { fontSize: 7, cellPadding: 1, overflow: "linebreak" },
    headStyles: { fillColor: [41, 128, 185], fontSize: 7 },
    columnStyles: {
      0: { cellWidth: 20 }, // Contrato
      1: { cellWidth: 20 }, // F. Emisión
      2: { cellWidth: 35 }, // Cliente
      3: { cellWidth: 25 }, // DNI/Teléfono
      4: { cellWidth: 35 }, // Dirección
      5: { cellWidth: 25 }, // T. Evento
      6: { cellWidth: 25 }, // F. Evento / Hora
      7: { cellWidth: 45 }, // Paquete / Detalle
      8: { cellWidth: 35 }, // Nombres/Bebe
      9: { cellWidth: 40 }, // Info Adic.
      10: { cellWidth: 40 }, // Observación
      11: { cellWidth: 15 }, // Precio
      12: { cellWidth: 15 }, // A Cuenta
      13: { cellWidth: 15 }, // Saldo
      14: { cellWidth: 15 }, // Pago P.
      15: { cellWidth: 25 }, // Comprobante
    },
  });

  const pdfBuffer = doc.output("arraybuffer");
  const dateRange = getFilenameRange(contracts);
  const fileName = `Contratos_${dateRange}.pdf`;

  await saveFileTauriOrWeb(
    pdfBuffer,
    fileName,
    "application/pdf",
    "¡PDF generado!",
  );
};
