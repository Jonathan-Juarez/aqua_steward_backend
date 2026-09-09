"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BadRequestError_1 = require("../../infrastructure/errors/BadRequestError");
const number_utils_1 = require("../utils/number-utils");
class Deposit {
    id;
    name;
    ip;
    capacity;
    installation_height;
    fill_gap;
    owner_id;
    sensors;
    createdAt;
    updatedAt;
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.ip = data.ip;
        this.capacity = data.capacity;
        this.installation_height = data.installation_height;
        this.fill_gap = data.fill_gap;
        this.owner_id = data.owner_id;
        // Array de sensores con los valores enviados por el usuario, si no se envían se inicializa vacío.
        this.sensors = data.sensors || [];
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }
    validate() {
        const ipRegex = /^((25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.)){3}(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)$/;
        if (!this.ip || !ipRegex.test(this.ip))
            throw new BadRequestError_1.BadRequestError("IP inválida");
        if (this.capacity == null || this.capacity < 0)
            throw new BadRequestError_1.BadRequestError("La capacidad debe ser un número positivo.");
        if (this.installation_height == null || this.installation_height < 0)
            throw new BadRequestError_1.BadRequestError("La altura de instalación debe ser un número positivo.");
        if (this.fill_gap == null || this.fill_gap < 0)
            throw new BadRequestError_1.BadRequestError("El espacio vacío debe ser un número positivo.");
        if (!this.isSensorActive("HC-SR04") && !this.isSensorActive("PH-4502C") && !this.isSensorActive("TS300B"))
            throw new BadRequestError_1.BadRequestError("Al menos un sensor debe estar activo");
    }
    // Transforma los valores crudos de los sensores (fórmulas matemáticas)
    transformRawValue(sensorType, rawValue) {
        if (sensorType === "PH-4502C") {
            const FACTOR_DIVISOR = 1.5;
            const VOLTAJE_REF_ESP = 3.3;
            const ADC_RESOLUTION = 4095.0;
            const voltajeESP = rawValue * (VOLTAJE_REF_ESP / ADC_RESOLUTION);
            const voltajeSensor = voltajeESP * FACTOR_DIVISOR;
            const currentPh = 7.0 - ((voltajeSensor - 2.5) / 0.18);
            return (0, number_utils_1.roundTo1Decimal)(currentPh);
        }
        if (sensorType === "TS300B") {
            const ADC_LIMPIO = 1980;
            const ADC_SUCIO = 1000;
            const NTU_MAX = 3000.0;
            const currentNtu = (rawValue - ADC_SUCIO) * (0 - NTU_MAX) / (ADC_LIMPIO - ADC_SUCIO) + NTU_MAX;
            // Se limita el valor entre 0 y 3000.
            return (0, number_utils_1.roundTo1Decimal)(Math.max(0, Math.min(NTU_MAX, currentNtu)));
        }
        if (sensorType === "HC-SR04") {
            const waterLevelCm = (this.installation_height ?? 0) - rawValue;
            const totalUsefulHeight = (this.installation_height ?? 0) - (this.fill_gap ?? 0);
            let percentage = (waterLevelCm / totalUsefulHeight) * 100;
            percentage = Math.max(0, Math.min(100, percentage));
            return (0, number_utils_1.roundTo1Decimal)(percentage);
        }
        return (0, number_utils_1.roundTo1Decimal)(rawValue);
    }
    // Verifica si el sensor está activo
    isSensorActive(sensorType) {
        const sensor = this.sensors.find((sensor) => sensor.type === sensorType);
        return sensor ? (sensor.state === true) : false;
    }
}
exports.default = Deposit;
