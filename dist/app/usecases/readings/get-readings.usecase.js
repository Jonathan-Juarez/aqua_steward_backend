"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NotFoundError_1 = require("../../../infrastructure/errors/NotFoundError");
const BadRequestError_1 = require("../../../infrastructure/errors/BadRequestError");
// Caso de uso para obtener las lecturas de un sensor en un depósito. Se exporta como clase.
class GetReadingsUseCase {
    depositRepository;
    readingRepository;
    constructor(depositRepository, readingRepository) {
        this.depositRepository = depositRepository;
        this.readingRepository = readingRepository;
    }
    async execute(dto) {
        const deposit = await this.depositRepository.findById(dto.depositId);
        if (!deposit)
            throw new NotFoundError_1.NotFoundError("El depósito no existe");
        // Se busca el sensor por tipo.
        const sensor = deposit.sensors.find(sensor => sensor.type === dto.sensorType);
        if (!sensor)
            throw new NotFoundError_1.NotFoundError(`Sensor ${dto.sensorType} no configurado en este depósito`);
        // Se obtiene el ID del sensor.
        const sensorId = sensor._id?.toString() ?? sensor.id;
        if (!sensorId)
            throw new BadRequestError_1.BadRequestError("ID del sensor no disponible");
        if (dto.filter === "Semana")
            return await this.readingRepository.getWeeklyReadings(dto.depositId, sensorId);
        if (dto.filter === "Mes")
            return await this.readingRepository.getMonthlyReadings(dto.depositId, sensorId);
        return await this.readingRepository.getTodayReadings(dto.depositId, sensorId);
    }
}
exports.default = GetReadingsUseCase;
