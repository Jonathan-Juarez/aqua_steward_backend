"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteMemberUseCase = void 0;
const BadRequestError_1 = require("../../../infrastructure/errors/BadRequestError");
const NotFoundError_1 = require("../../../infrastructure/errors/NotFoundError");
const firebase_service_1 = require("../../../infrastructure/services/firebase.service");
const notification_model_1 = __importDefault(require("../../../infrastructure/database/models/notification-model"));
class DeleteMemberUseCase {
    teamRepository;
    authRepository;
    depositRepository;
    constructor(teamRepository, authRepository, depositRepository) {
        this.teamRepository = teamRepository;
        this.authRepository = authRepository;
        this.depositRepository = depositRepository;
    }
    async execute(dto) {
        if (!dto.deposit_id || !dto.user_id) {
            throw new BadRequestError_1.BadRequestError("No se proporcionó el depósito o el usuario para eliminar el miembro");
        }
        const user = await this.authRepository.findById(dto.user_id);
        if (!user) {
            throw new BadRequestError_1.BadRequestError("No se encontró ningún usuario con el ID proporcionado");
        }
        const assignmentIndex = user.assigned_deposits?.findIndex(assigned => assigned.deposit_id?.toString() === dto.deposit_id);
        if (assignmentIndex === undefined || assignmentIndex === -1) {
            throw new NotFoundError_1.NotFoundError("El miembro a eliminar no se encuentra en el equipo");
        }
        await this.teamRepository.delete(dto.deposit_id, dto.user_id);
        // Obtener información del depósito para la notificación
        const deposit = await this.depositRepository.findById(dto.deposit_id);
        const depositName = deposit ? deposit.name : "un depósito";
        const description = `Has sido removido del depósito "${depositName}".`;
        // Guardar notificación en la base de datos asociada al usuario afectado
        const notification = new notification_model_1.default({
            generation_date: new Date(),
            state: "activa",
            title: "Equipo",
            type: "team_removed",
            description,
            user_id: dto.user_id
        });
        await notification.save();
        // Enviar notificación push al usuario expulsado para que actualice su estado local
        if (user.fcmTokens && user.fcmTokens.length > 0) {
            await (0, firebase_service_1.sendPushNotification)(user.fcmTokens, "Removido del equipo", description, {
                type: "team_removed",
                deposit_id: dto.deposit_id
            });
        }
    }
}
exports.DeleteMemberUseCase = DeleteMemberUseCase;
