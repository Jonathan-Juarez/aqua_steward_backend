// Establece la estructura exacta del sensor esperada desde el cliente en una petición HTTP.
export interface ISensorDTO {
    type: string;
    state: boolean;
    unit: string;
    min_value?: number;
    max_value: number;
}

// Define el contrato estricto de entrada para crear un depósito, excluyendo identificadores y fechas para prevenir inyección de datos (Mass Assignment / Asignación Masiva).
export interface ICreateDepositDTO {
    name: string;
    ip: string;
    capacity: number;
    installation_height: number;
    fill_gap: number;
    owner_id: string; // Puede ser un string que luego se convierte a ObjectId
    sensors: ISensorDTO[];
}


// DTO para la respuesta del get-deposits, mantiene la entidad pura y añade el metadato del rol.
export interface DepositResponseDTO {
    id?: string;
    name?: string;
    ip?: string;
    capacity?: number;
    installation_height?: number;
    fill_gap?: number;
    owner_id?: string;
    sensors: any[];
    role: string;
    createdAt?: Date;
    updatedAt?: Date;
}
