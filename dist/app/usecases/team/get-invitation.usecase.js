"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetInvitationUseCase = void 0;
const BadRequestError_1 = require("../../../infrastructure/errors/BadRequestError");
class GetInvitationUseCase {
    teamRepository;
    authRepository;
    constructor(teamRepository, authRepository) {
        this.teamRepository = teamRepository;
        this.authRepository = authRepository;
    }
    async execute(dto) {
        if (!dto.user_id)
            throw new BadRequestError_1.BadRequestError("No se proporcionó el usuario para obtener las invitaciones");
        const user = await this.authRepository.findById(dto.user_id);
        if (!user) {
            throw new BadRequestError_1.BadRequestError("No se encontró ningún usuario con el ID proporcionado");
        }
        return await this.teamRepository.getInvitations(dto.user_id);
    }
}
exports.GetInvitationUseCase = GetInvitationUseCase;
