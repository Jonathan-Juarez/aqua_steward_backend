"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NotFoundError_1 = require("../../../infrastructure/errors/NotFoundError");
const BadRequestError_1 = require("../../../infrastructure/errors/BadRequestError");
class ExportReadingsUseCase {
    depositRepository;
    readingRepository;
    constructor(depositRepository, readingRepository) {
        this.depositRepository = depositRepository;
        this.readingRepository = readingRepository;
    }
    async execute(dto) {
        if (!dto.sensorTypes || dto.sensorTypes.length === 0) {
            throw new BadRequestError_1.BadRequestError("Debes especificar al menos un sensor para exportar");
        }
        const deposit = await this.depositRepository.findById(dto.depositId);
        if (!deposit)
            throw new NotFoundError_1.NotFoundError("El depósito no existe");
        // Mapear los sensorTypes a sus IDs correspondientes definidos en el depósito
        const sensorIds = [];
        for (const type of dto.sensorTypes) {
            const sensor = deposit.sensors.find(s => s.type === type);
            if (sensor) {
                const id = sensor._id?.toString() ?? sensor.id;
                if (id) {
                    sensorIds.push(id);
                }
            }
        }
        if (sensorIds.length === 0) {
            throw new BadRequestError_1.BadRequestError("Ninguno de los sensores solicitados está configurado en este depósito");
        }
        return await this.readingRepository.exportReadings(dto.depositId, sensorIds, dto.filter);
    }
}
exports.default = ExportReadingsUseCase;
