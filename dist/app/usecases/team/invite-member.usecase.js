"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InviteMemberUseCase = void 0;
const BadRequestError_1 = require("../../../infrastructure/errors/BadRequestError");
const ConflictError_1 = require("../../../infrastructure/errors/ConflictError");
const firebase_service_1 = require("../../../infrastructure/services/firebase.service");
class InviteMemberUseCase {
    teamRepository;
    authRepository;
    depositRepository;
    constructor(teamRepository, authRepository, depositRepository) {
        this.teamRepository = teamRepository;
        this.authRepository = authRepository;
        this.depositRepository = depositRepository;
    }
    async execute(dto) {
        if (!dto.deposit_id || !dto.email || !dto.role) {
            throw new BadRequestError_1.BadRequestError("No se proporcionó el depósito, el email o el rol para invitar al miembro");
        }
        const user = await this.authRepository.findByEmail(dto.email);
        if (!user) {
            throw new BadRequestError_1.BadRequestError("No se encontró ningún usuario con el correo proporcionado");
        }
        const alreadyAssigned = user.assigned_deposits?.find(a => a.deposit_id === dto.deposit_id);
        if (alreadyAssigned) {
            throw new ConflictError_1.ConflictError("El usuario ya pertenece al equipo de este depósito");
        }
        const member = await this.teamRepository.invite(dto.deposit_id, dto.email, dto.role);
        if (!member)
            throw new BadRequestError_1.BadRequestError("No se pudo invitar al miembro");
        // Obtener información del depósito para la notificación push
        const deposit = await this.depositRepository.findById(dto.deposit_id);
        const depositName = deposit ? deposit.name : "un depósito";
        // Enviar notificación push al usuario invitado
        if (user.fcmTokens && user.fcmTokens.length > 0) {
            const roleLabels = {
                admin: "Administrador",
                analyst: "Analista",
                technician: "Técnico"
            };
            const roleLabel = roleLabels[dto.role] || dto.role;
            await (0, firebase_service_1.sendPushNotification)(user.fcmTokens, "Nueva invitación de equipo", `Has sido invitado a colaborar en el depósito "${depositName}" como ${roleLabel}.`, {
                type: "invitation",
                deposit_id: dto.deposit_id
            });
        }
        return member;
    }
}
exports.InviteMemberUseCase = InviteMemberUseCase;
