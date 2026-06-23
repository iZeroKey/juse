import type { JuseEvent } from "@/types/event";
import { format, parse, subMinutes } from "date-fns";
import { es } from "date-fns/locale";
import { calculateDuration, formatDuration } from "./utils";

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function generateEventMessage(event: JuseEvent): string {
  const dateObj = parse(event.date, "yyyy-MM-dd", new Date());

  const dayName = format(dateObj, "EEEE", { locale: es }).toUpperCase();
  const dayNumber = format(dateObj, "d", { locale: es });
  const monthName = capitalizeFirstLetter(
    format(dateObj, "MMMM", { locale: es }),
  );
  const formattedDate = `🚨🗓️ *${dayName} ${dayNumber} de ${monthName}*`;

  const durationStr = formatDuration(
    calculateDuration(event.startTime, event.endTime),
  );
  const tematicaPart = event.tematica
    ? ` (${event.tematica.toUpperCase()})`
    : "";
  const headerLine = `${event.eventType.toUpperCase()}${tematicaPart} ${durationStr} ✨✨✨`;

  const startObj = parse(event.startTime, "HH:mm", new Date());
  const formatAmPm = (d: Date) => format(d, "h:mma").toLowerCase();

  const encuentroTime = formatAmPm(subMinutes(startObj, 90));
  const salidaTime = formatAmPm(subMinutes(startObj, 60));
  const llegadaTime = formatAmPm(subMinutes(startObj, 30));
  const inicioTime = formatAmPm(startObj);

  const timesSection = `⏰ HORA DE ENCUENTRO *${encuentroTime}*

🚖 *SALIDA AL SHOW ${salidaTime}*

✅ *LLEGADA AL LOCAL ${llegadaTime}*

🎉 *INICIO DEL SHOW ${inicioTime}*`;

  const staffLines: string[] = [];
  if (event.animadores.length > 0) {
    staffLines.push(`✨ Animador(a)(es): ${event.animadores.join(", ")}`);
  }
  if (event.dj.length > 0) {
    staffLines.push(`✨ DJ: ${event.dj.join(", ")}`);
  }
  if (event.bailarines.length > 0) {
    staffLines.push(`✨ Bailarín(a)(es): ${event.bailarines.join(", ")}`);
  }
  if (event.staffLucido.length > 0) {
    staffLines.push(`✨ Staff Lúdico: ${event.staffLucido.join(", ")}`);
  }
  if (event.staffApoyo.length > 0) {
    staffLines.push(`✨ Staff de Apoyo: ${event.staffApoyo.join(", ")}`);
  }
  if (event.muneco.length > 0) {
    staffLines.push(`✨ Muñeco: ${event.muneco.join(", ")}`);
  }
  if (event.payaso.length > 0) {
    staffLines.push(`✨ Payaso: ${event.payaso.join(", ")}`);
  }
  if (event.showMagia.length > 0) {
    staffLines.push(`✨ Show de Magia: ${event.showMagia.join(", ")}`);
  }
  const staffSection = staffLines.join("\n");

  const locationLine = `📍 ${event.location.toUpperCase()}`;

  const saldoText =
    event.movilidad > 0 ? `${event.saldo} + MOVILIDADES` : `${event.saldo}`;
  const financeSection = `SALDO: ${saldoText}`;

  const observacionSection = "🚨 " + event.observacion.toUpperCase();

  const cleanedNum = event.contactoNumero.replace(/\D/g, "");
  let localNum = cleanedNum;
  if (cleanedNum.startsWith("51")) {
    localNum = cleanedNum.slice(2);
  }

  const match = localNum.match(/^(\d{3})(\d{3})(\d{3})$/);
  let formattedNumber = "";
  if (match) {
    formattedNumber = `+51 ${match[1]} ${match[2]} ${match[3]}`;
  } else if (localNum) {
    formattedNumber = `+51 ${localNum}`;
  }

  const contactSection = formattedNumber
    ? `${formattedNumber} - ${event.contactoNombre}`
    : "";

  const parts = [
    formattedDate,
    headerLine,
    timesSection,
    staffSection,

    locationLine,
    financeSection,
    observacionSection,
    contactSection,
  ];

  return parts.filter((p) => p.trim() !== "").join("\n\n");
}
