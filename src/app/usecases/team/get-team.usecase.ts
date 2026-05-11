import { ITeamRepository } from "../../../domain/repository/team-repository.interface";
import TeamMember from "../../../domain/entities/team";
import { GetTeamDTO } from "../../dtos/team.dto";
import { BadRequestError } from "../../../infrastructure/errors/BadRequestError";

export class GetTeamUseCase {
    constructor(private teamRepository: ITeamRepository) { }

    async execute(dto: GetTeamDTO): Promise<TeamMember[]> {
        if (!dto.deposit_id) throw new BadRequestError("No se proporcionó el depósito para obtener el equipo");
        return await this.teamRepository.getTeam(dto.deposit_id);
    }
}
