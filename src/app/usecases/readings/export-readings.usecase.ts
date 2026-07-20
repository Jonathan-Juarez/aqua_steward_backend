import { IDepositRepository } from "../../../domain/repository/deposit-repository.interface";
import IReadingRepository, { ExportedReading } from "../../../domain/repository/reading-repository.interface";
import { NotFoundError } from "../../../infrastructure/errors/NotFoundError";
import { BadRequestError } from "../../../infrastructure/errors/BadRequestError";
import { ExportReadingsDTO } from "../../dtos/reading.dto";

export default class ExportReadingsUseCase {
    constructor(
        private depositRepository: IDepositRepository,
        private readingRepository: IReadingRepository
    ) { }

    async execute(dto: ExportReadingsDTO): Promise<ExportedReading[]> {
        if (!dto.sensorTypes || dto.sensorTypes.length === 0) {
            throw new BadRequestError("Debes especificar al menos un sensor para exportar");
        }

        const deposit = await this.depositRepository.findById(dto.depositId);
        if (!deposit) throw new NotFoundError("El depósito no existe");

        // Mapear los sensorTypes a sus IDs correspondientes definidos en el depósito
        const sensorIds: string[] = [];
        for (const type of dto.sensorTypes) {
            const sensor = deposit.sensors.find(s => s.type === type);
            if (sensor) {
                const id = (sensor as any)._id?.toString() ?? (sensor as any).id;
                if (id) {
                    sensorIds.push(id);
                }
            }
        }

        if (sensorIds.length === 0) {
            throw new BadRequestError("Ninguno de los sensores solicitados está configurado en este depósito");
        }

        return await this.readingRepository.exportReadings(dto.depositId, sensorIds, dto.filter);
    }
}
