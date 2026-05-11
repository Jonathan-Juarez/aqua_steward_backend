import Deposit from "../../../domain/entities/deposit";
import { IDepositRepository } from "../../../domain/repository/deposit-repository.interface";
import { BadRequestError } from "../../../infrastructure/errors/BadRequestError";

export default class DeleteDepositUseCase {
    constructor(private depositRepository: IDepositRepository) { }

    async execute(id: string): Promise<Deposit | null> {
        if (!id) throw new BadRequestError("No se encontró el depósito a eliminar");
        return await this.depositRepository.delete(id);
    }
}
