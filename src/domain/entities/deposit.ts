export interface IDepositDTO {
    id?: string;
    name?: string;
    ip?: string;
    capacity?: number;
    installation_height?: number;
    fill_gap?: number;
    owner_id?: string;
    sensors?: any[];
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
    sensors: any[];
    createdAt?: Date;
    updatedAt?: Date;

    constructor(data: IDepositDTO) {
        this.id = data.id;
        this.name = data.name;
        this.ip = data.ip;
        this.capacity = data.capacity;
        this.installation_height = data.installation_height;
        this.fill_gap = data.fill_gap;
        this.owner_id = data.owner_id;

        // Valores por defecto para sensores, asignando un arreglo si es null.
        this.sensors = data.sensors && data.sensors.length > 0 ? data.sensors : [{
            type: ["HC-SR04", "PH-4502C", "TS300B"],
            state: ["inactivo", "activo",],
            unit: ["L", "pH", "NTU"]
        }];

        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }

    validate(): void {
        const ipRegex = /^((25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.)){3}(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)$/;
        if (!this.ip || !ipRegex.test(this.ip)) throw new Error("IP inválida");

        if (this.capacity == null || this.capacity < 0) throw new Error("La capacidad debe ser un número positivo.");
        if (this.installation_height == null || this.installation_height < 0) throw new Error("La altura de instalación debe ser un número positivo.");
        if (this.fill_gap == null || this.fill_gap < 0) throw new Error("El espacio vacío debe ser un número positivo.");
    }

    // Transforma los valores crudos de los sensores (fórmulas matemáticas)
    transformRawValue(sensorType: string, rawValue: number): number {
        if (sensorType === "PH-4502C") {
            const FACTOR_DIVISOR = 1.5;
            const VOLTAJE_REF_ESP = 3.3;
            const ADC_RESOLUTION = 4095.0;
            const voltajeESP = rawValue * (VOLTAJE_REF_ESP / ADC_RESOLUTION);
            const voltajeSensor = voltajeESP * FACTOR_DIVISOR;
            const ph = 7.0 - ((voltajeSensor - 2.5) / 0.18);
            return parseFloat(ph.toFixed(2));
        }

        if (sensorType === "TS300B") {
            const ADC_LIMPIO = 1580;
            const ADC_SUCIO = 1000;
            const NTU_MAX = 3000.0;
            const ntu = (rawValue - ADC_SUCIO) * (0 - NTU_MAX) / (ADC_LIMPIO - ADC_SUCIO) + NTU_MAX;
            return parseFloat(Math.max(0, Math.min(NTU_MAX, ntu)).toFixed(2));
        }

        if (sensorType === "HC-SR04") {
            const waterLevelCm = (this.installation_height ?? 0) - rawValue;
            const totalUsefulHeight = (this.installation_height ?? 0) - (this.fill_gap ?? 0);
            let percentage = (waterLevelCm / totalUsefulHeight) * 100;
            percentage = Math.max(0, Math.min(100, percentage));
            const currentLitters = (percentage / 100) * (this.capacity ?? 0);
            return parseFloat(currentLitters.toFixed(1));
        }

        return rawValue;
    }

    // Verifica si el sensor está activo
    isSensorActive(sensorType: string): boolean {
        const sensor = this.sensors.find((s: any) => s.type === sensorType);
        return sensor && (sensor.state === true || sensor.state === "true" || sensor.state === "activo");
    }
}
