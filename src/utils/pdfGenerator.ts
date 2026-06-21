import { formatFecha, formatHora, formatPhoneNumber } from "@/lib/utils";
import type { JuseContract } from "@/types/contract";
import { PDFDocument, PDFFont, PDFPage, StandardFonts } from "pdf-lib";
import { numeroALetras } from "./numberToWords";
import { sileo } from "sileo";

export async function drawTextAligned(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  font: PDFFont,
  size: number,
  alignX: "left" | "center" | "right",
  alignY: "bottom" | "middle" | "top",
  maxWidth?: number,
  lineHeight?: number,
  maxLines?: number // <-- NUEVO PARÁMETRO ESTRELLA
) {
  let currentSize = size;
  let lines: string[] = [];

  // Función auxiliar interna para calcular el salto de línea según un tamaño específico
  const getWrappedLines = (textSize: number) => {
    const words = text.replace(/\n/g, " ").trim().split(" ");
    let tempLines: string[] = [];
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = font.widthOfTextAtSize(testLine, textSize);

      if (testWidth > (maxWidth || 9999) && currentLine) {
        tempLines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) tempLines.push(currentLine);
    return tempLines;
  };

  // Lógica principal
  if (maxWidth) {
    if (maxLines) {
      // Bucle mágico: reduce la fuente de 0.5 en 0.5 hasta que encaje en el máximo de líneas
      while (currentSize >= 5) {
        lines = getWrappedLines(currentSize);
        if (lines.length <= maxLines) break; // ¡Encajó!
        currentSize -= 0.5; 
      }
    } else {
      lines = getWrappedLines(currentSize);
    }
  } else {
    lines = text.split("\n");
  }

  const actualLineHeight = lineHeight || currentSize * 1.2;
  const blockHeight = (lines.length - 1) * actualLineHeight + currentSize;

  let currentY = y;
  if (alignY === "top") {
    currentY = y - currentSize;
  } else if (alignY === "middle") {
    currentY = y + blockHeight / 2 - currentSize;
  } else if (alignY === "bottom") {
    currentY = y + blockHeight - currentSize;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineWidth = font.widthOfTextAtSize(line, currentSize);
    let startX = x;

    if (alignX === "center") {
      startX = x - lineWidth / 2;
    } else if (alignX === "right") {
      startX = x - lineWidth;
    }

    page.drawText(line, {
      x: startX,
      y: currentY - i * actualLineHeight,
      font,
      size: currentSize, // <-- Imprime con el tamaño dinámico reducido
    });
  }
}

// CONFIGURACIÓN PARA EL RECIBO
const reciboConfig = {
  fechaEmision: { x: 325, y: 735, size: 10, isBold: true, alignX: "center", alignY: "bottom" },
  contratoNumber: { x: 506, y: 735, size: 11, isBold: true, alignX: "center", alignY: "bottom" },
  
  clienteNombre: { x: 247, y: 700, size: 11, isBold: false, alignX: "center", alignY: "bottom", maxWidth: 280, maxLines: 1 },
  cantidadLetras: { x: 138, y: 680, size: 10, isBold: false, alignX: "left", alignY: "bottom", maxWidth: 360, maxLines: 1 },
  
  simboloMonto: { x: 465, y: 701, size: 14, isBold: false, alignX: "left", alignY: "bottom" },
  cantidadMonto: { x: 550, y: 701, size: 14, isBold: false, alignX: "right", alignY: "bottom" },
  
  // Concepto limitado a 3 líneas (achicará la fuente si es necesario)
  paqueteDetalle: { x: 345, y: 642, size: 8, isBold: true, alignX: "center", alignY: "middle", maxWidth: 400, lineHeight: 11, maxLines: 3 },
  
  formaPago: { x: 505, y: 586, size: 10, isBold: true, alignX: "center", alignY: "bottom" },
  simboloPrecio: { x: 455, y: 556, size: 9, isBold: false, alignX: "left", alignY: "bottom" },
  precio: { x: 553, y: 556, size: 9, isBold: false, alignX: "right", alignY: "bottom" },
  simboloAcuenta: { x: 455, y: 542, size: 9, isBold: false, alignX: "left", alignY: "bottom" },
  aCuenta: { x: 553, y: 542, size: 9, isBold: false, alignX: "right", alignY: "bottom" },
  simboloSaldo: { x: 455, y: 528, size: 9, isBold: true, alignX: "left", alignY: "bottom" },
  saldo: { x: 553, y: 528, size: 9, isBold: true, alignX: "right", alignY: "bottom" },
} as const;

// CONFIGURACIÓN PARA EL CONTRATO
const contratoConfig = {
  contratoNumber: { x: 531, y: 731, size: 10, isBold: true, alignX: "center", alignY: "middle" },
  fechaEmision: { x: 531, y: 718, size: 10, isBold: true, alignX: "center", alignY: "middle" },
  
  clienteNombre: { x: 210, y: 650, size: 9, isBold: false, alignX: "center", alignY: "middle", maxWidth: 165, maxLines: 1 },
  fechaEvento: { x: 485, y: 650, size: 9, isBold: false, alignX: "center", alignY: "middle", maxWidth: 165, maxLines: 1 },
  clienteDni: { x: 210, y: 637, size: 9, isBold: false, alignX: "center", alignY: "middle", maxWidth: 165, maxLines: 1 },
  tipoEvento: { x: 485, y: 637, size: 9, isBold: false, alignX: "center", alignY: "middle", maxWidth: 165, maxLines: 2 },
  
  clienteDireccion: { x: 210, y: 616, size: 8, isBold: false, alignX: "center", alignY: "middle", maxWidth: 165, lineHeight: 11, maxLines: 2 },
  horaEvento: { x: 485, y: 616, size: 9, isBold: false, alignX: "center", alignY: "middle", maxWidth: 165, maxLines: 1 },
  clienteCelular: { x: 210, y: 595, size: 9, isBold: false, alignX: "center", alignY: "middle", maxWidth: 165, maxLines: 1 },
  paqueteId: { x: 485, y: 595, size: 9, isBold: false, alignX: "center", alignY: "middle", maxWidth: 165, maxLines: 1 },
  
  paqueteDetalle: { x: 305, y: 530, size: 10, isBold: false, alignX: "center", alignY: "middle", maxWidth: 510, lineHeight: 14, maxLines: 3 },
  
  nombreBebe: { x: 210, y: 455, size: 9, isBold: false, alignX: "center", alignY: "bottom", maxWidth: 165, maxLines: 1 },
  nombresPapitos: { x: 210, y: 439, size: 9, isBold: false, alignX: "center", alignY: "middle", maxWidth: 165, lineHeight: 11, maxLines: 2 },
  nombreCumpleanero: { x: 210, y: 414, size: 9, isBold: false, alignX: "center", alignY: "bottom", maxWidth: 165, maxLines: 1 },
  informacionAdicional: { x: 210, y: 397, size: 9, isBold: false, alignX: "center", alignY: "bottom", maxWidth: 165, lineHeight: 11, maxLines: 1 },

  formaPago: { x: 443, y: 226, size: 10, isBold: false, alignX: "center", alignY: "bottom" },
  simboloPrecio: { x: 400, y: 213, size: 10, isBold: false, alignX: "left", alignY: "bottom" },
  precio: { x: 480, y: 213, size: 10, isBold: false, alignX: "right", alignY: "bottom" },
  simboloAcuenta: { x: 400, y: 199, size: 10, isBold: false, alignX: "left", alignY: "bottom" },
  aCuenta: { x: 480, y: 199, size: 10, isBold: false, alignX: "right", alignY: "bottom" },
  simboloSaldo: { x: 400, y: 185, size: 10, isBold: true, alignX: "left", alignY: "bottom" },
  saldo: { x: 480, y: 185, size: 10, isBold: true, alignX: "right", alignY: "bottom" },
  
  // Valores de Movilidad limitados a 1 sola línea (se encogerá si el texto es muy largo)
  movilidadTotal: { x: 530, y: 218, size: 9, isBold: true, alignX: "center", alignY: "middle", maxWidth: 80, lineHeight: 11, maxLines: 1 },
  movilidadSaldo: { x: 530, y: 190, size: 9, isBold: true, alignX: "center", alignY: "middle", maxWidth: 80, lineHeight: 11, maxLines: 1 }
} as const;

async function injectData(
  page: PDFPage,
  data: Record<string, string>,
  configMap: Record<string, any>,
  fontRegular: PDFFont,
  fontBold: PDFFont,
) {
  const GLOBAL_OFFSET_Y = -32;

  for (const [key, config] of Object.entries(configMap)) {
    const text = data[key];
    if (!text) continue;

    await drawTextAligned(
      page,
      text,
      config.x,
      config.y + GLOBAL_OFFSET_Y,
      config.isBold ? fontBold : fontRegular,
      config.size,
      config.alignX,
      config.alignY,
      config.maxWidth,
      config.lineHeight,
      config.maxLines
    );
  }
}

export async function generarReciboPDF(
  data: JuseContract & { paqueteNombre?: string },
) {
  const url = "/recibo.pdf";
  const existingPdfBytes = await fetch(url).then((res) => res.arrayBuffer());
  const pdfDoc = await PDFDocument.load(existingPdfBytes);

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const page = pdfDoc.getPages()[0];

  const injectMap = {
    fechaEmision: formatFecha(data.fechaEmision),
    contratoNumber: data.contratoNumber,
    clienteNombre: data.clienteNombre,
    cantidadLetras: numeroALetras(data.aCuenta),
    paqueteDetalle: data.paqueteDetalle || "",
    formaPago: data.formaPago,

    // Símbolos separados para alineación perfecta
    simboloMonto: "S/",
    simboloPrecio: "S/",
    simboloAcuenta: "S/",
    simboloSaldo: "S/",

    cantidadMonto: data.aCuenta.toFixed(2),
    precio: data.precio.toFixed(2),
    aCuenta: data.aCuenta.toFixed(2),
    saldo: data.saldo.toFixed(2),
  };

  await injectData(page, injectMap, reciboConfig, fontRegular, fontBold);

  const pdfBytes = await pdfDoc.save();
  
  if (typeof window !== 'undefined' && window.__TAURI_INTERNALS__) {
    const { writeFile, mkdir } = await import('@tauri-apps/plugin-fs');
    const { downloadDir, join } = await import('@tauri-apps/api/path');
    
    try {
      const customPath = localStorage.getItem('downloadPath');
      let juseDir;
      
      if (customPath) {
        juseDir = customPath;
      } else {
        const baseDir = await downloadDir();
        juseDir = await join(baseDir, 'Juse');
      }
      
      try {
        await mkdir(juseDir, { recursive: true });
      } catch (e) {
        // Ignorar si el directorio ya existe
      }

      const fileName = `Recibo_${data.contratoNumber}.pdf`;
      const filePath = await join(juseDir, fileName);
      
      await writeFile(filePath, pdfBytes);
      
      const folderName = juseDir.split(/[\\/]/).pop();
      const { invoke } = await import('@tauri-apps/api/core');
      sileo.success({
        title: '¡Recibo generado!',
        description: `Carpeta: ${folderName} / ${fileName}`,
        duration: 60000,
        button: {
          title: 'Abrir recibo',
          onClick: async () => {
            try {
              await invoke('open_local_file', { path: filePath });
            } catch (e) {
              console.error(e);
            }
          }
        }
      });
    } catch (err) {
      console.error("Error guardando el recibo:", err);
      sileo.error({ title: 'Error', description: 'No se pudo guardar el archivo en Descargas' });
    }
  } else {
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Recibo_${data.contratoNumber}.pdf`;
    link.click();
    
    sileo.success({
      title: '¡Recibo descargado!',
      description: 'El archivo se descargó en tu navegador',
      duration: 60000,
      button: {
        title: 'Ver recibo',
        onClick: () => {
          window.open(url, '_blank');
        }
      }
    });
  }
}

export async function generarContratoPDF(
  data: JuseContract & { paqueteNombre?: string },
) {
  const url = "/contrato.pdf";
  const existingPdfBytes = await fetch(url).then((res) => res.arrayBuffer());
  const pdfDoc = await PDFDocument.load(existingPdfBytes);

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const page = pdfDoc.getPages()[0];

  const injectMap = {
    contratoNumber: data.contratoNumber,
    fechaEmision: formatFecha(data.fechaEmision),
    clienteNombre: data.clienteNombre,
    clienteDni: data.clienteDni,
    clienteDireccion: data.clienteDireccion,
    clienteCelular: formatPhoneNumber(data.clienteCelular),

    // Aplicando formateadores
    fechaEvento: formatFecha(data.fechaEvento),
    tipoEvento: data.tipoEvento,
    horaEvento: formatHora(data.horaEvento),

    // Verifica aquí que tu frontend te pase el string real del paquete (B-PAQ...)
    paqueteId: data.paqueteNombre || data.paqueteId || "",

    paqueteDetalle: data.paqueteDetalle || "",
    nombreBebe: data.nombreBebe || "",
    nombresPapitos: data.nombresPapitos || "",
    nombreCumpleanero: data.nombreCumpleanero || "",
    informacionAdicional: data.informacionAdicional || "",
    formaPago: data.formaPago,

    // Símbolos separados
    simboloPrecio: "S/",
    simboloAcuenta: "S/",
    simboloSaldo: "S/",

    // Valores Monetarios
    precio: data.precio.toFixed(2),
    aCuenta: data.aCuenta.toFixed(2),
    saldo: data.saldo.toFixed(2),

    // Movilidad inyectada (se asume que data.movilidad dice "MAS MOVILIDAD" o "INCLUIDA")
    movilidadTotal: data.movilidad || "",
    movilidadSaldo: data.movilidad || "",
  };

  await injectData(page, injectMap, contratoConfig, fontRegular, fontBold);

  const pdfBytes = await pdfDoc.save();
  
  if (typeof window !== 'undefined' && window.__TAURI_INTERNALS__) {
    const { writeFile, mkdir } = await import('@tauri-apps/plugin-fs');
    const { downloadDir, join } = await import('@tauri-apps/api/path');
    
    try {
      const customPath = localStorage.getItem('downloadPath');
      let juseDir;
      
      if (customPath) {
        juseDir = customPath;
      } else {
        const baseDir = await downloadDir();
        juseDir = await join(baseDir, 'Juse');
      }
      
      try {
        await mkdir(juseDir, { recursive: true });
      } catch (e) {
        // Ignorar si el directorio ya existe
      }

      const fileName = `Contrato_${data.contratoNumber}.pdf`;
      const filePath = await join(juseDir, fileName);
      
      await writeFile(filePath, pdfBytes);
      
      const folderName = juseDir.split(/[\\/]/).pop();
      const { invoke } = await import('@tauri-apps/api/core');
      sileo.success({
        title: '¡Contrato generado!',
        description: `Carpeta: ${folderName} / ${fileName}`,
        duration: 60000,
        button: {
          title: 'Abrir contrato',
          onClick: async () => {
            try {
              await invoke('open_local_file', { path: filePath });
            } catch (e) {
              console.error(e);
            }
          }
        }
      });
    } catch (err) {
      console.error("Error guardando el contrato:", err);
      sileo.error({ title: 'Error', description: 'No se pudo guardar el archivo en Descargas' });
    }
  } else {
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Contrato_${data.contratoNumber}.pdf`;
    link.click();
    
    sileo.success({
      title: '¡Contrato descargado!',
      description: 'El archivo se descargó en tu navegador',
      duration: 60000,
      button: {
        title: 'Ver contrato',
        onClick: () => {
          window.open(url, '_blank');
        }
      }
    });
  }
}
