"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTeamUseCase = void 0;
const BadRequestError_1 = require("../../../infrastructure/errors/BadRequestError");
class GetTeamUseCase {
    teamRepository;
    constructor(teamRepository) {
        this.teamRepository = teamRepository;
    }
    async execute(dto) {
        if (!dto.deposit_id)
            throw new BadRequestError_1.BadRequestError("No se proporcionó el depósito para obtener el equipo");
        return await this.teamRepository.getTeam(dto.deposit_id);
    }
}
exports.GetTeamUseCase = GetTeamUseCase;
