import { ITeamRepository } from "../../../domain/repository/team-repository.interface";
import { IAuthRepository } from "../../../domain/repository/auth-repository.interface";
import TeamMember from "../../../domain/entities/team";
import { UpdateMemberDTO } from "../../dtos/team.dto";
import { BadRequestError } from "../../../infrastructure/errors/BadRequestError";

export class UpdateMemberUseCase {
    constructor(
        private teamRepository: ITeamRepository,
        private authRepository: IAuthRepository
    ) { }

    async execute(dto: UpdateMemberDTO): Promise<TeamMember> {
        if (!dto.deposit_id || !dto.user_id || !dto.role) {
            throw new BadRequestError("No se proporcionó el depósito, el usuario o el rol para actualizar el miembro");
        }

        const user = await this.authRepository.findById(dto.user_id);
        if (!user) {
            throw new BadRequestError("No se proporcionó el ID del usuario para actualizar el miembro");
        }

        const assignmentDeposit = user.assigned_deposits?.find((assigned: any) => assigned.deposit_id === dto.deposit_id || assigned.deposit_id?.toString() === dto.deposit_id);

        if (!assignmentDeposit || assignmentDeposit.status !== "accepted") {
            throw new BadRequestError("No se puede actualizar al miembro porque su invitación no ha sido aceptada");
        }

        const updatedMember = await this.teamRepository.update(dto.deposit_id, dto.user_id, dto.role);
        if (!updatedMember) throw new BadRequestError("No se pudo actualizar al miembro");

        return updatedMember;
    }
}
