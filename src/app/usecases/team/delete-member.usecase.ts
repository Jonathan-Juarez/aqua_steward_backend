import { ITeamRepository } from "../../../domain/repository/team-repository.interface";
import { IAuthRepository } from "../../../domain/repository/auth-repository.interface";
import { DeleteMemberDTO } from "../../dtos/team.dto";
import { BadRequestError } from "../../../infrastructure/errors/BadRequestError";
import { NotFoundError } from "../../../infrastructure/errors/NotFoundError";

export class DeleteMemberUseCase {
    constructor(
        private teamRepository: ITeamRepository,
        private authRepository: IAuthRepository
    ) { }

    async execute(dto: DeleteMemberDTO): Promise<void> {
        if (!dto.deposit_id || !dto.user_id) {
            throw new BadRequestError("No se proporcionó el depósito o el usuario para eliminar el miembro");
        }

        const user = await this.authRepository.findById(dto.user_id);
        if (!user) {
            throw new BadRequestError("No se encontró ningún usuario con el ID proporcionado");
        }

        const assignmentIndex = user.assigned_deposits?.findIndex(a => a.deposit_id === dto.deposit_id);
        if (assignmentIndex === undefined || assignmentIndex === -1) {
            throw new NotFoundError("El miembro a eliminar no se encontró en el equipo");
        }

        await this.teamRepository.delete(dto.deposit_id, dto.user_id);
    }
}
