import { formatFecha, formatHora } from "@/lib/utils";
import type { JuseContract } from "@/types/contract";
import { PDFDocument, PDFFont, PDFPage, StandardFonts } from "pdf-lib";
import { numeroALetras } from "./numberToWords";

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
) {
  let lines: string[] = [];

  if (maxWidth) {
    const words = text.split(" ");
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = font.widthOfTextAtSize(testLine, size);

      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
  } else {
    lines = text.split("\n");
  }

  const actualLineHeight = lineHeight || size * 1.2;
  const blockHeight = (lines.length - 1) * actualLineHeight + size;

  let currentY = y;
  if (alignY === "top") {
    currentY = y - size;
  } else if (alignY === "middle") {
    currentY = y + blockHeight / 2 - size;
  } else if (alignY === "bottom") {
    currentY = y + blockHeight - size;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineWidth = font.widthOfTextAtSize(line, size);
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
      size,
    });
  }
}

// CONFIGURACIÓN PARA EL RECIBO
const reciboConfig = {
  // Cabecera superior
  fechaEmision: { x: 325, y: 735, size: 10, isBold: true, alignX: "center", alignY: "bottom" },
  contratoNumber: { x: 506, y: 735, size: 11, isBold: true, alignX: "center", alignY: "bottom" },
  
  // Datos principales
  clienteNombre: { x: 247, y: 700, size: 11, isBold: false, alignX: "center", alignY: "bottom" },
  cantidadLetras: { x: 138, y: 680, size: 10, isBold: false, alignX: "left", alignY: "bottom" },
  
  // Monto principal (Símbolo separado para estilo Excel)
  simboloMonto: { x: 465, y: 701, size: 14, isBold: false, alignX: "left", alignY: "bottom" },
  cantidadMonto: { x: 550, y: 701, size: 14, isBold: false, alignX: "right", alignY: "bottom" },
  
  // Concepto (Bajado al centro matemático exacto de la caja)
  paqueteDetalle: { x: 345, y: 642, size: 8, isBold: true, alignX: "center", alignY: "middle", maxWidth: 400, lineHeight: 11 },
  
  // Finanzas inferiores
  formaPago: { x: 505, y: 586, size: 10, isBold: true, alignX: "center", alignY: "bottom" },
  
  simboloPrecio: { x: 455, y: 556, size: 9, isBold: false, alignX: "left", alignY: "bottom" },
  precio: { x: 553, y: 556, size: 9, isBold: false, alignX: "right", alignY: "bottom" },
  
  simboloAcuenta: { x: 455, y: 542, size: 9, isBold: false, alignX: "left", alignY: "bottom" },
  aCuenta: { x: 553, y: 542, size: 9, isBold: false, alignX: "right", alignY: "bottom" },
  
  // Saldo en Negrita
  simboloSaldo: { x: 455, y: 528, size: 9, isBold: true, alignX: "left", alignY: "bottom" },
  saldo: { x: 553, y: 528, size: 9, isBold: true, alignX: "right", alignY: "bottom" },
} as const;

// CONFIGURACIÓN PARA EL CONTRATO
const contratoConfig = {
  contratoNumber: { x: 531, y: 731, size: 10, isBold: true, alignX: "center", alignY: "middle" },
  fechaEmision: { x: 531, y: 718, size: 10, isBold: true, alignX: "center", alignY: "middle" },
  
  // Bloque 1: DATOS (Subidos de vuelta a su posición correcta)
  clienteNombre: { x: 210, y: 650, size: 9, isBold: false, alignX: "center", alignY: "middle" },
  fechaEvento: { x: 485, y: 650, size: 9, isBold: false, alignX: "center", alignY: "middle" },
  
  clienteDni: { x: 210, y: 636, size: 9, isBold: false, alignX: "center", alignY: "middle" },
  tipoEvento: { x: 485, y: 636, size: 9, isBold: false, alignX: "center", alignY: "middle" },
  
  clienteDireccion: { x: 210, y: 616, size: 8, isBold: false, alignX: "center", alignY: "middle", maxWidth: 165, lineHeight: 11 },
  horaEvento: { x: 485, y: 616, size: 9, isBold: false, alignX: "center", alignY: "middle" },
  
  clienteCelular: { x: 210, y: 596, size: 9, isBold: false, alignX: "center", alignY: "middle" },
  paqueteId: { x: 485, y: 596, size: 9, isBold: false, alignX: "center", alignY: "middle" },
  
  // Bloque 2: ESPECIFICACIONES (Alineado al medio de la caja blanca)
  paqueteDetalle: { x: 305, y: 530, size: 10, isBold: false, alignX: "center", alignY: "middle", maxWidth: 510, lineHeight: 14 },
  
  // Bloque 3: DATOS ADICIONALES
  nombreBebe: { x: 210, y: 454, size: 9, isBold: false, alignX: "center", alignY: "bottom" },
  nombresPapitos: { x: 210, y: 437, size: 9, isBold: false, alignX: "center", alignY: "middle",  maxWidth: 165, lineHeight: 11  },
  nombreCumpleanero: { x: 210, y: 412, size: 9, isBold: false, alignX: "center", alignY: "bottom" },
  informacionAdicional: { x: 210, y: 398, size: 9, isBold: false, alignX: "center", alignY: "bottom", maxWidth: 165, lineHeight: 11 },

  // Bloque 4: VALOR DEL SERVICIO
  formaPago: { x: 443, y: 226, size: 10, isBold: false, alignX: "center", alignY: "bottom" },
  
  // Montos numéricos (Separados con el "S/" a la izquierda)
  simboloPrecio: { x: 400, y: 213, size: 10, isBold: false, alignX: "left", alignY: "bottom" },
  precio: { x: 480, y: 213, size: 10, isBold: false, alignX: "right", alignY: "bottom" },
  
  simboloAcuenta: { x: 400, y: 199, size: 10, isBold: false, alignX: "left", alignY: "bottom" },
  aCuenta: { x: 480, y: 199, size: 10, isBold: false, alignX: "right", alignY: "bottom" },
  
  // Saldo en Negrita
  simboloSaldo: { x: 400, y: 185, size: 10, isBold: true, alignX: "left", alignY: "bottom" },
  saldo: { x: 480, y: 185, size: 10, isBold: true, alignX: "right", alignY: "bottom" },
  
  // Valores de Movilidad
  movilidadTotal: { x: 530, y: 218, size: 9, isBold: true, alignX: "center", alignY: "middle", maxWidth: 80, lineHeight: 11 },
  movilidadSaldo: { x: 530, y: 190, size: 9, isBold: true, alignX: "center", alignY: "middle", maxWidth: 80, lineHeight: 11 }
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
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `Recibo_${data.contratoNumber}.pdf`;
  link.click();
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
    clienteCelular: data.clienteCelular,

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
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `Contrato_${data.contratoNumber}.pdf`;
  link.click();
}
