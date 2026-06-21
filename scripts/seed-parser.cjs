const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\erick\\.gemini\\antigravity\\brain\\5246d299-c7eb-45dd-991f-11ed3f850494\\.system_generated\\logs\\transcript_full.jsonl';
const outPath = path.join(__dirname, '..', 'src', 'data', 'seed.ts');

const lines = fs.readFileSync(logPath, 'utf-8').split('\n');
let firstPrompt = '';
for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const obj = JSON.parse(line);
    if (obj.step_index === 0 && obj.type === 'USER_INPUT') {
      firstPrompt = obj.content;
      break;
    }
  } catch (e) { }
}

const packagesBlock = firstPrompt.match(/NRO PAQUETE\tESPECIFICACIONES\t PRECIO \t MOVILIDAD \tTIPO DE EVENTO\n([\s\S]+?)\n\n\nTenemos que permitir/);
const contractsBlock = firstPrompt.match(/NOMBRE DEL CUMPLEA'ERO\n([\s\S]+)/);

const packagesData = packagesBlock ? packagesBlock[1].split('\n') : [];
const contractsData = contractsBlock ? contractsBlock[1].split('\n') : [];

const packages = packagesData.filter(Boolean).map(line => {
  const [nroPaquete, especificaciones, precioRaw, movilidad, tipoEvento] = line.split('\t');
  if (!nroPaquete) return null;
  const precioMatch = precioRaw?.match(/[\d,.]+/);
  const precio = precioMatch ? parseFloat(precioMatch[0].replace(',', '')) : 0;
  return {
    id: crypto.randomUUID(),
    nroPaquete: nroPaquete.trim(),
    especificaciones: especificaciones ? especificaciones.split(' / ').map(s => s.trim()).filter(Boolean).flatMap(str => {
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
    }) : [],
    precio: precio,
    movilidad: movilidad ? movilidad.trim() : '',
    tipoEvento: tipoEvento ? tipoEvento.trim() : 'Personalizado',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}).filter(Boolean);

const contracts = contractsData.filter(Boolean).map(line => {
  const parts = line.split('\t');
  if (parts.length < 10) return null;
  const [
    contratoNumber, fechaEmision, clienteNombre, clienteDni, clienteDireccion, clienteCelular,
    tipoEvento, fechaEvento, horaEvento, paqueteIdRaw, paqueteDetalle, movilidad,
    precioRaw, aCuentaRaw, saldoRaw, formaPago, nombresPapitos, nombreBebe, nombreCumpleanero
  ] = parts;

  if (!contratoNumber) return null;

  const parseMoney = (str) => {
    if (!str) return 0;
    const match = str.match(/[\d,.]+/);
    return match ? parseFloat(match[0].replace(',', '')) : 0;
  };

  return {
    id: crypto.randomUUID(),
    contratoNumber: contratoNumber.trim(),
    fechaEmision: fechaEmision ? fechaEmision.trim() : '',
    clienteNombre: clienteNombre ? clienteNombre.trim() : '',
    clienteDni: clienteDni ? clienteDni.trim() : '',
    clienteDireccion: clienteDireccion ? clienteDireccion.trim() : '',
    clienteCelular: clienteCelular ? clienteCelular.trim() : '',
    tipoEvento: tipoEvento ? tipoEvento.trim() : 'Personalizado',
    fechaEvento: fechaEvento ? fechaEvento.trim().split('/').reverse().join('-') : '', // assuming dd/mm/yyyy to yyyy-mm-dd
    horaEvento: horaEvento ? horaEvento.trim() : '',
    paqueteId: '',
    paqueteDetalle: paqueteDetalle ? paqueteDetalle.trim() : '',
    movilidad: movilidad ? movilidad.trim() : '',
    precio: parseMoney(precioRaw),
    aCuenta: parseMoney(aCuentaRaw),
    saldo: parseMoney(saldoRaw),
    formaPago: formaPago ? formaPago.trim() : '',
    nombresPapitos: nombresPapitos ? nombresPapitos.trim() : '',
    nombreBebe: nombreBebe ? nombreBebe.trim() : '',
    nombreCumpleanero: nombreCumpleanero ? nombreCumpleanero.trim() : '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}).filter(Boolean);

fs.mkdirSync(path.join(__dirname, '..', 'src', 'data'), { recursive: true });

const fileContent = `import type { JusePackage } from '@/types/package';
import type { JuseContract } from '@/types/contract';

export const defaultPackages: JusePackage[] = ${JSON.stringify(packages, null, 2)};

export const defaultContracts: JuseContract[] = ${JSON.stringify(contracts, null, 2)};
`;

fs.writeFileSync(outPath, fileContent);
console.log('Seed data generated successfully!');
