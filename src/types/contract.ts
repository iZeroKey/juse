export interface JuseContract {
  id: string;
  contratoNumber: string; // e.g., 2025-001
  fechaEmision: string; // e.g., "13/02/2025" or ISO "2025-02-13"
  
  // Datos del Cliente
  clienteNombre: string;
  clienteDni: string;
  clienteDireccion: string;
  clienteCelular: string;
  
  // Datos del Evento
  tipoEvento: string;
  fechaEvento: string; // ISO date
  horaEvento: string; // e.g., "4:00 PM" or "16:00"
  
  // Paquete
  paqueteId?: string; // Optional reference to the package
  paqueteDetalle: string;
  movilidad: string;
  
  // Finanzas (en S/)
  precio: number;
  aCuenta: number;
  saldo: number;
  formaPago: string;
  
  // Información Adicional
  nombresPapitos: string;
  nombreBebe: string;
  nombreCumpleanero: string;
  informacionAdicional: string;
  
  // Meta
  createdAt: string;
  updatedAt: string;
}

export interface ContractFormValues {
  // We match these with the ones from JuseContract mostly as strings for forms
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
  paqueteDetalle: string;
  movilidad: string;
  precio: string;
  aCuenta: string;
  formaPago: string;
  nombresPapitos: string;
  nombreBebe: string;
  nombreCumpleanero: string;
  informacionAdicional: string;
}
