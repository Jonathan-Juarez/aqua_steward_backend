import Deposit from "../../../domain/entities/deposit";
import { IDepositRepository } from "../../../domain/repository/deposit-repository.interface";

export default class GetDepositsUseCase {
    constructor(private depositRepository: IDepositRepository) { }

    async execute(ownerId: string): Promise<Deposit[]> {
        if (!ownerId) {
            throw new Error("El ID del dueño es requerido para obtener sus depósitos");
        }
        return await this.depositRepository.findByOwnerId(ownerId);
    }
}
