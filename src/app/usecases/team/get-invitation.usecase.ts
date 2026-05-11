import { ITeamRepository } from "../../../domain/repository/team-repository.interface";
import { IAuthRepository } from "../../../domain/repository/auth-repository.interface";
import { GetInvitationDTO } from "../../dtos/team.dto";
import { BadRequestError } from "../../../infrastructure/errors/BadRequestError";

export class GetInvitationUseCase {
    constructor(
        private teamRepository: ITeamRepository,
        private authRepository: IAuthRepository
    ) { }

    async execute(dto: GetInvitationDTO): Promise<any[]> {
        if (!dto.user_id) throw new BadRequestError("No se proporcionó el usuario para obtener las invitaciones");
        
        const user = await this.authRepository.findById(dto.user_id);
        if (!user) {
            throw new BadRequestError("No se encontró ningún usuario con el ID proporcionado");
        }

        return await this.teamRepository.getInvitations(dto.user_id);
    }
}
