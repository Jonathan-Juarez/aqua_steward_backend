import { DepositResponseDTO } from "../../dtos/deposit.dto";
import { IAuthRepository } from "../../../domain/repository/auth-repository.interface";
import { IDepositRepository } from "../../../domain/repository/deposit-repository.interface";
import { NotFoundError } from "../../../infrastructure/errors/NotFoundError";
import { BadRequestError } from "../../../infrastructure/errors/BadRequestError";

export default class GetDepositsUseCase {
    constructor(private depositRepository: IDepositRepository, private authRepository: IAuthRepository) { }

    async execute(id: string): Promise<DepositResponseDTO[]> {
        // Se estrae el ID del campo assigned_deposits del usuario.
        const user = await this.authRepository.findById(id);
        if (!user) {
            throw new BadRequestError("No se proporcionó el ID del usuario para obtener sus depósitos");
        }
        // Solo se incluyen los depósitos con invitación aceptada.
        const acceptedDeposits = user.assigned_deposits?.filter((deposit: any) => deposit.status === "accepted") || [];

        // Se extraen los IDs de los depósitos aceptados.
        const depositIds = acceptedDeposits.map((deposit: any) => deposit.deposit_id);
        // Si no hay depósitos aceptados, se retorna un array vacío.
        if (depositIds.length === 0) {
            return [];
        }

        // Se retorna todos los depósitos que coincidan con el ID.
        const deposits = await this.depositRepository.findByIds(depositIds);

        // Se adjunta el rol a cada depósito devolviendo un DTO plano.
        const userDeposits = deposits.map(deposit => {
            const assigned = user.assigned_deposits?.find((userDeposit: any) => userDeposit.deposit_id.toString() === deposit.id);
            return {
                id: deposit.id,
                name: deposit.name,
                ip: deposit.ip,
                capacity: deposit.capacity,
                installation_height: deposit.installation_height,
                fill_gap: deposit.fill_gap,
                owner_id: deposit.owner_id,
                sensors: deposit.sensors,
                createdAt: deposit.createdAt,
                updatedAt: deposit.updatedAt,
                role: assigned ? assigned.role : "analyst"
            };
        });
        return userDeposits;
    }
}
