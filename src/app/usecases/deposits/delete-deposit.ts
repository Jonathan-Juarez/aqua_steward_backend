import Deposit from "../../../domain/entities/deposit";
import { IDepositRepository } from "../../../domain/repository/deposit-repository.interface";

export default class DeleteDepositUseCase {
    constructor(private depositRepository: IDepositRepository) { }

    async execute(id: string): Promise<Deposit | null> {
        if (!id) throw new Error("El ID del depósito es requerido");
        return await this.depositRepository.delete(id);
    }
}
