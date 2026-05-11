import { IDepositRepository } from "../../../domain/repository/deposit-repository.interface";
import Deposit from "../../../domain/entities/deposit";
import { BadRequestError } from "../../../infrastructure/errors/BadRequestError";
import { NotFoundError } from "../../../infrastructure/errors/NotFoundError";
import { ConflictError } from "../../../infrastructure/errors/ConflictError";

export default class UpdateDepositUseCase {
    constructor(private depositRepository: IDepositRepository) { }

    async execute(id: string, data: Partial<Deposit>): Promise<Deposit | null> {
        if (!id) throw new BadRequestError("No se proporcionó el ID del depósito a actualizar");

        const deposit = await this.depositRepository.findById(id);

        if (!deposit) throw new NotFoundError("No se encontró el depósito a actualizar");


        // Define las propiedades primitivas que pueden ser actualizadas.
        const updatableProperties: (keyof Partial<Deposit>)[] = ['name', 'ip', 'capacity', 'installation_height', 'fill_gap'];

        // Comprueba si alguna de las propiedades primitivas enviadas difiere del registro actual.
        const hasPrimitiveChanges = updatableProperties.some(property => data[property] !== undefined && data[property] !== deposit[property]);

        // Verifica si la configuración de los sensores ha sido alterada, ignorando los identificadores de MongoDB.
        const hasSensorChanges = data.sensors && deposit.sensors && (
            data.sensors.length !== deposit.sensors.length ||
            data.sensors.some(newSensor => {
                const existingSensor = deposit.sensors!.find(sensor => sensor.type === newSensor.type);
                return !existingSensor ||
                    existingSensor.state !== newSensor.state ||
                    existingSensor.min_value !== newSensor.min_value ||
                    existingSensor.max_value !== newSensor.max_value ||
                    existingSensor.unit !== newSensor.unit;
            })
        );

        // Interrumpe la operación si no se registra ninguna alteración en los datos.
        if (!hasPrimitiveChanges && !hasSensorChanges) throw new ConflictError("No se detectaron cambios para actualizar");

        // Se evalúa si el sensor existe y si tiene un _id para conservarlo y no perder el historial.
        if (data.sensors && deposit.sensors) {
            data.sensors = data.sensors.map(newSensor => {
                const existingSensor = deposit.sensors.find(sensor => sensor.type === newSensor.type);
                // Si el sensor existe y tiene un _id, se le asigna el _id del sensor existente para no perder el historial.
                if (existingSensor && existingSensor._id) {
                    return { ...newSensor, _id: existingSensor._id };
                }
                return newSensor;
            });
        }

        return await this.depositRepository.update(id, data);
    }
}
