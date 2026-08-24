"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcceptInvitationUseCase = void 0;
const BadRequestError_1 = require("../../../infrastructure/errors/BadRequestError");
const NotFoundError_1 = require("../../../infrastructure/errors/NotFoundError");
class AcceptInvitationUseCase {
    teamRepository;
    authRepository;
    constructor(teamRepository, authRepository) {
        this.teamRepository = teamRepository;
        this.authRepository = authRepository;
    }
    async execute(dto) {
        if (!dto.deposit_id || !dto.user_id) {
            throw new BadRequestError_1.BadRequestError("No se proporcionó el depósito o el usuario para aceptar la invitación");
        }
        const user = await this.authRepository.findById(dto.user_id);
        if (!user) {
            throw new BadRequestError_1.BadRequestError("No se encontró ningún usuario con el ID proporcionado");
        }
        const assignmentIndex = user.assigned_deposits?.findIndex(assigned => assigned.deposit_id?.toString() === dto.deposit_id);
        if (assignmentIndex === undefined || assignmentIndex === -1) {
            throw new NotFoundError_1.NotFoundError("Invitación no encontrada");
        }
        await this.teamRepository.acceptInvitation(dto.deposit_id, dto.user_id);
    }
}
exports.AcceptInvitationUseCase = AcceptInvitationUseCase;
