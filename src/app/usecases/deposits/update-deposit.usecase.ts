import { IDepositRepository } from "../../../domain/repository/deposit-repository.interface";
import Deposit from "../../../domain/entities/deposit";
import { BadRequestError } from "../../../infrastructure/errors/BadRequestError";
import { NotFoundError } from "../../../infrastructure/errors/NotFoundError";
import { ConflictError } from "../../../infrastructure/errors/ConflictError";

export default class UpdateDepositUseCase {
    constructor(private depositRepository: IDepositRepository) { }

    async execute(id: string, data: Partial<Deposit>): Promise<Deposit | null> {
        if (!id) throw new BadRequestError("No se proporcionó el ID del depósito a actualizar");

        // Se obtiene el depósito existente.
        const existingDeposit = await this.depositRepository.findById(id);
        if (!existingDeposit) throw new NotFoundError("No se encontró el depósito a actualizar");

        // Se preservan los _id de MongoDB de los sensores existentes para conservar el historial.
        const mergedSensors = data.sensors?.map(newSensor => {
            const currentSensor = existingDeposit.sensors?.find(s => s.type === newSensor.type);
            return currentSensor?._id ? { ...newSensor, _id: currentSensor._id } : newSensor;
        }) ?? existingDeposit.sensors;

        // Se crea la nueva entidad de Dominio fusionada.
        const updatedDeposit = new Deposit({
            ...existingDeposit,
            ...data,
            sensors: mergedSensors
        });

        // Se validan las reglas de negocio en la Entidad (IP, dimensiones y al menos un sensor activo).
        updatedDeposit.validate();

        // Si cambió la IP, se verifica que no esté duplicada en otro depósito.
        if (data.ip && data.ip !== existingDeposit.ip) {
            const ipConflict = await this.depositRepository.findByIp(data.ip);
            if (ipConflict) throw new ConflictError("La IP ya pertenece a otro depósito");
        }

        // Se guardan los cambios.
        return await this.depositRepository.update(id, updatedDeposit);
    }
}
