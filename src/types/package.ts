export interface JusePackage {
  nombre: string;
  id: string;
  nroPaquete: string;
  especificaciones: string;
  precio: number;
  movilidad: string;
  tipoEvento: string;
  createdAt: string;
  updatedAt: string;
}

export interface PackageFormValues {
  nroPaquete: string;
  especificaciones: string;
  precio: string;
  movilidad: string;
  tipoEvento: string;
}
