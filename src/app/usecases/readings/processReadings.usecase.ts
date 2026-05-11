import { IDepositRepository } from "../../../domain/repository/deposit-repository.interface";
import IReadingRepository from "../../../domain/repository/reading-repository.interface";
import IRealTimeGateway from "../../../domain/repository/realtime-repository.interface";
import { IReadingRawDTO, IReadingProcessedDTO } from "../../dtos/reading.dto";
import Reading from "../../../domain/entities/reading";

// Mapa que relaciona cada tópico MQTT con el tipo de sensor correspondiente. Record<string, string> es un mapa donde la clave y el valor son strings.
const TOPIC_TO_SENSOR: Record<string, string> = {
    "distancia": "HC-SR04",
    "ph": "PH-4502C",
    "turbidez": "TS300B"
};

// Caso de uso genérico que procesa la lectura de cualquier sensor.
export default class ProcessReadingsUseCase {
    constructor(
        private depositRepository: IDepositRepository,
        private readingRepository: IReadingRepository,
        private realTimeGateway: IRealTimeGateway
    ) { }

    async execute(dto: IReadingRawDTO): Promise<IReadingProcessedDTO> {
        const sensorType = TOPIC_TO_SENSOR[dto.topicKey];
        if (!sensorType) throw new Error(`Tópico desconocido: ${dto.topicKey}`);

        // Se busca el depósito asociado a la IP del dispositivo.
        const deposit = await this.depositRepository.findByIp(dto.deviceIp);
        if (!deposit) throw new Error(`IP desconocida: ${dto.deviceIp}`);

        // Se verifica que el sensor esté activo en el depósito.
        if (!deposit.isSensorActive(sensorType)) {
            throw new Error(`Sensor ${sensorType} en ${deposit.name} no está activo.`);
        }

        // Se transforma el valor crudo al valor físico usando la entidad de dominio.
        const processedValue = deposit.transformRawValue(sensorType, dto.rawValue);

        // Se obtiene el ID del sensor desde la entidad para la metadata de la lectura.
        const sensor = deposit.sensors.find(sensor => sensor.type === sensorType);

        const reading = new Reading({
            date: new Date(),
            value: processedValue,
            metadata: {
                sensor_id: (sensor as any)?._id?.toString() ?? (sensor as any)?.id,
                deposits_id: deposit.id!,
                sensor_type: sensorType
            }
        });

        reading.validate();

        // Se persiste la lectura en el bucket correspondiente.
        await this.readingRepository.saveBucket(reading);

        // Se emite el evento al cliente WebSocket a través de nuestro gateway (puerto de salida)
        this.realTimeGateway.emitDepositUpdate(dto.deviceIp, dto.topicKey, processedValue);

        return {
            sensorType,
            deviceIp: dto.deviceIp,
            processedValue
        };
    }
}
