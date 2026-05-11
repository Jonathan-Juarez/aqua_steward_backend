import { ITeamRepository } from "../../../domain/repository/team-repository.interface";
import { IAuthRepository } from "../../../domain/repository/auth-repository.interface";
import TeamMember from "../../../domain/entities/team";
import { InviteMemberDTO } from "../../dtos/team.dto";
import { BadRequestError } from "../../../infrastructure/errors/BadRequestError";
import { ConflictError } from "../../../infrastructure/errors/ConflictError";

export class InviteMemberUseCase {
    constructor(
        private teamRepository: ITeamRepository,
        private authRepository: IAuthRepository
    ) { }

    async execute(dto: InviteMemberDTO): Promise<TeamMember> {
        if (!dto.deposit_id || !dto.email || !dto.role) {
            throw new BadRequestError("No se proporcionó el depósito, el email o el rol para invitar al miembro");
        }

        const user = await this.authRepository.findByEmail(dto.email);
        if (!user) {
            throw new BadRequestError("No se encontró ningún usuario con el correo proporcionado");
        }

        const alreadyAssigned = user.assigned_deposits?.find(a => a.deposit_id === dto.deposit_id);
        if (alreadyAssigned) {
            throw new ConflictError("El usuario ya pertenece al equipo de este depósito");
        }

        const member = await this.teamRepository.invite(dto.deposit_id, dto.email, dto.role);
        if (!member) throw new BadRequestError("No se pudo invitar al miembro");
        
        return member;
    }
}
