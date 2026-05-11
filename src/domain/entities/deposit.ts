import { BadRequestError } from "../../infrastructure/errors/BadRequestError";

// Define la estructura pura de un sensor en memoria para tipar las propiedades internas de la entidad.
export interface SensorData {
    _id?: string;
    type?: string;
    state?: boolean;
    unit?: string;
    min_value?: number;
    max_value?: number;
}

// Define los datos requeridos para construir o reconstruir la entidad, permitiendo campos autogenerados como identificadores y fechas.
export interface DepositData {
    id?: string;
    name?: string;
    ip?: string;
    capacity?: number;
    installation_height?: number;
    fill_gap?: number;
    owner_id?: string;
    sensors?: SensorData[];
    createdAt?: Date;
    updatedAt?: Date;
}

export default class Deposit {
    id?: string;
    name?: string;
    ip?: string;
    capacity?: number;
    installation_height?: number;
    fill_gap?: number;
    owner_id?: string;
    sensors: SensorData[];
    createdAt?: Date;
    updatedAt?: Date;

    constructor(data: DepositData) {
        this.id = data.id;
        this.name = data.name;
        this.ip = data.ip;
        this.capacity = data.capacity;
        this.installation_height = data.installation_height;
        this.fill_gap = data.fill_gap;
        this.owner_id = data.owner_id;

        // Valores por defecto para sensores
        this.sensors = data.sensors?.length ? data.sensors : this.getDefaultSensors();

        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }

    private getDefaultSensors(): SensorData[] {
        return [
            { type: "HC-SR04", state: false, unit: "L", min_value: 0, max_value: 100 },
            { type: "PH-4502C", state: true, unit: "pH", min_value: 0, max_value: 14 },
            { type: "TS300B", state: true, unit: "NTU", min_value: 0, max_value: 3000 }
        ];
    }

    validate(): void {
        const ipRegex = /^((25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.)){3}(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)$/;
        if (!this.ip || !ipRegex.test(this.ip)) throw new BadRequestError("IP inválida");

        if (this.capacity == null || this.capacity < 0) throw new BadRequestError("La capacidad debe ser un número positivo.");
        if (this.installation_height == null || this.installation_height < 0) throw new BadRequestError("La altura de instalación debe ser un número positivo.");
        if (this.fill_gap == null || this.fill_gap < 0) throw new BadRequestError("El espacio vacío debe ser un número positivo.");
    }

    // Transforma los valores crudos de los sensores (fórmulas matemáticas)
    transformRawValue(sensorType: string, rawValue: number): number {
        if (sensorType === "PH-4502C") {
            const FACTOR_DIVISOR = 1.5;
            const VOLTAJE_REF_ESP = 3.3;
            const ADC_RESOLUTION = 4095.0;
            const voltajeESP = rawValue * (VOLTAJE_REF_ESP / ADC_RESOLUTION);
            const voltajeSensor = voltajeESP * FACTOR_DIVISOR;
            const currentPh = 7.0 - ((voltajeSensor - 2.5) / 0.18);
            return parseFloat(currentPh.toFixed(1));
        }

        if (sensorType === "TS300B") {
            const ADC_LIMPIO = 1980;
            const ADC_SUCIO = 1000;
            const NTU_MAX = 3000.0;
            const currentNtu = (rawValue - ADC_SUCIO) * (0 - NTU_MAX) / (ADC_LIMPIO - ADC_SUCIO) + NTU_MAX;
            // Se limita el valor entre 0 y 3000.
            return parseFloat(Math.max(0, Math.min(NTU_MAX, currentNtu)).toFixed(1));
        }

        if (sensorType === "HC-SR04") {
            const waterLevelCm = (this.installation_height ?? 0) - rawValue;
            const totalUsefulHeight = (this.installation_height ?? 0) - (this.fill_gap ?? 0);
            let percentage = (waterLevelCm / totalUsefulHeight) * 100;
            percentage = Math.max(0, Math.min(100, percentage));
            // const currentLitters = (percentage / 100) * (this.capacity ?? 0);
            return parseFloat(percentage.toFixed(1));
        }

        return rawValue;
    }

    // Verifica si el sensor está activo
    isSensorActive(sensorType: string): boolean {
        const sensor = this.sensors.find((sensor: SensorData) => sensor.type === sensorType);
        return sensor ? (sensor.state === true) : false;
    }
}
