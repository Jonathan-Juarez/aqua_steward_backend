import { IDepositRepository } from "../../../domain/repository/deposit-repository.interface";
import IReadingRepository from "../../../domain/repository/reading-repository.interface";
import { NotFoundError } from "../../../infrastructure/errors/NotFoundError";
import { BadRequestError } from "../../../infrastructure/errors/BadRequestError";
import { GetReadingsDTO } from "../../dtos/reading.dto";

// Interface para tipado de las lecturas.
export interface GetReadingPromise {
    hour?: number;
    day?: number;
    value: number;
}

// Caso de uso para obtener las lecturas de un sensor en un depósito. Se exporta como clase.
export default class GetReadingsUseCase {
    constructor(
        private depositRepository: IDepositRepository,
        private readingRepository: IReadingRepository
    ) { }

    async execute(dto: GetReadingsDTO): Promise<GetReadingPromise[]> {
        const deposit = await this.depositRepository.findById(dto.depositId);
        if (!deposit) throw new NotFoundError("El depósito no existe");

        // Se busca el sensor por tipo.
        const sensor = deposit.sensors.find(sensor => sensor.type === dto.sensorType);
        if (!sensor) throw new NotFoundError(`Sensor ${dto.sensorType} no configurado en este depósito`);

        // Se obtiene el ID del sensor.
        const sensorId = (sensor as any)._id?.toString() ?? (sensor as any).id;
        if (!sensorId) throw new BadRequestError("ID del sensor no disponible");

        if (dto.filter === "Semana") return await this.readingRepository.getWeeklyReadings(dto.depositId, sensorId);

        if (dto.filter === "Mes") return await this.readingRepository.getMonthlyReadings(dto.depositId, sensorId);

        return await this.readingRepository.getTodayReadings(dto.depositId, sensorId);
    }
}
