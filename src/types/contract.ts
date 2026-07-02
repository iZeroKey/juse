export interface JuseContract {
  id: string;
  contratoNumber: string;
  fechaEmision: string;
  clienteNombre: string;
  clienteDni: string;
  clienteDireccion: string;
  clienteCelular: string;
  tipoEvento: string;
  fechaEvento: string;
  horaEvento: string;
  paqueteId?: string;
  paqueteNombre?: string;
  paqueteDetalle: string;
  movilidad: string;
  precio: number;
  aCuenta: number;
  saldo: number;
  formaPago: string;
  nombresPapitos: string;
  nombreBebe: string;
  nombreCumpleanero: string;
  informacionAdicional: string;
  pagoPersonal: number;
  tipoComprobante: string;
  observacion?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContractFormValues {
  contratoNumber: string;
  fechaEmision: string;
  clienteNombre: string;
  clienteDni: string;
  clienteDireccion: string;
  clienteCelular: string;
  tipoEvento: string;
  fechaEvento: string;
  horaEvento: string;
  paqueteId: string;
  paqueteNombre: string;
  paqueteDetalle: string;
  movilidad: string;
  precio: string;
  aCuenta: string;
  formaPago: string;
  nombresPapitos: string;
  nombreBebe: string;
  nombreCumpleanero: string;
  informacionAdicional: string;
  pagoPersonal: string;
  tipoComprobante: string;
  observacion: string;
}
