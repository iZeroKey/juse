export interface PackageSpecification {
  value: string;
  isSpecial?: boolean;
}

export interface JusePackage {
  id: string;
  nroPaquete: string; // e.g., I-PAQ001
  especificaciones: PackageSpecification[];
  precio: number;
  movilidad: string;
  tipoEvento: string;
  createdAt: string;
  updatedAt: string;
}

export interface PackageFormValues {
  nroPaquete: string;
  especificaciones: PackageSpecification[];
  precio: string; // Stored as string in form, parsed to number
  movilidad: string;
  tipoEvento: string;
}
