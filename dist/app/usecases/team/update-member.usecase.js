"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateMemberUseCase = void 0;
const BadRequestError_1 = require("../../../infrastructure/errors/BadRequestError");
const firebase_service_1 = require("../../../infrastructure/services/firebase.service");
const notification_model_1 = __importDefault(require("../../../infrastructure/database/models/notification-model"));
class UpdateMemberUseCase {
    teamRepository;
    authRepository;
    depositRepository;
    constructor(teamRepository, authRepository, depositRepository) {
        this.teamRepository = teamRepository;
        this.authRepository = authRepository;
        this.depositRepository = depositRepository;
    }
    async execute(dto) {
        if (!dto.deposit_id || !dto.user_id || !dto.role) {
            throw new BadRequestError_1.BadRequestError("No se proporcionó el depósito, el usuario o el rol para actualizar el miembro");
        }
        const user = await this.authRepository.findById(dto.user_id);
        if (!user) {
            throw new BadRequestError_1.BadRequestError("No se proporcionó el ID del usuario para actualizar el miembro");
        }
        const assignmentDeposit = user.assigned_deposits?.find((assigned) => assigned.deposit_id === dto.deposit_id || assigned.deposit_id?.toString() === dto.deposit_id);
        if (!assignmentDeposit || assignmentDeposit.status !== "accepted") {
            throw new BadRequestError_1.BadRequestError("No se puede actualizar al miembro porque su invitación no ha sido aceptada");
        }
        const updatedMember = await this.teamRepository.update(dto.deposit_id, dto.user_id, dto.role);
        if (!updatedMember)
            throw new BadRequestError_1.BadRequestError("No se pudo actualizar al miembro");
        // Obtener información del depósito para la notificación
        const deposit = await this.depositRepository.findById(dto.deposit_id);
        const depositName = deposit ? deposit.name : "un depósito";
        const roleLabels = {
            admin: "Administrador",
            analyst: "Analista",
            technician: "Técnico"
        };
        const roleLabel = roleLabels[dto.role] || dto.role;
        const description = `Tu rol en el depósito "${depositName}" ha sido actualizado a ${roleLabel}.`;
        // Guardar notificación en la base de datos asociada al usuario afectado
        const notification = new notification_model_1.default({
            generation_date: new Date(),
            state: "activa",
            title: "Equipo",
            type: "team_role_changed",
            description,
            user_id: dto.user_id
        });
        await notification.save();
        // Enviar notificación push al usuario cuyo rol cambió
        if (user.fcmTokens && user.fcmTokens.length > 0) {
            await (0, firebase_service_1.sendPushNotification)(user.fcmTokens, "Cambio de rol", description, {
                type: "team_role_changed",
                deposit_id: dto.deposit_id
            });
        }
        return updatedMember;
    }
}
exports.UpdateMemberUseCase = UpdateMemberUseCase;
