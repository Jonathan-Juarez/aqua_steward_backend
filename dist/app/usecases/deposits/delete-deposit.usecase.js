"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BadRequestError_1 = require("../../../infrastructure/errors/BadRequestError");
const firebase_service_1 = require("../../../infrastructure/services/firebase.service");
const notification_model_1 = __importDefault(require("../../../infrastructure/database/models/notification-model"));
const user_model_1 = __importDefault(require("../../../infrastructure/database/models/user-model"));
class DeleteDepositUseCase {
    depositRepository;
    teamRepository;
    constructor(depositRepository, teamRepository) {
        this.depositRepository = depositRepository;
        this.teamRepository = teamRepository;
    }
    async execute(id) {
        if (!id)
            throw new BadRequestError_1.BadRequestError("No se encontró el depósito a eliminar");
        const deposit = await this.depositRepository.findById(id);
        if (!deposit)
            return null;
        // Obtener miembros del equipo para enviarles la notificación
        const team = await this.teamRepository.getTeam(id);
        const deleted = await this.depositRepository.delete(id);
        // Desvincular este depósito de la lista de todos los usuarios
        await user_model_1.default.updateMany({ "assigned_deposits.deposit_id": id }, { $pull: { assigned_deposits: { deposit_id: id } } });
        // Enviar push y guardar notificación en base de datos para los miembros del equipo (excluyendo el owner)
        for (const member of team) {
            if (member.user_id === deposit.owner_id)
                continue;
            const description = `El depósito "${deposit.name}" ha sido eliminado por su propietario.`;
            // Guardar en base de datos
            const notification = new notification_model_1.default({
                generation_date: new Date(),
                state: "activa",
                title: "Equipo",
                type: "team_removed",
                description,
                user_id: member.user_id
            });
            await notification.save();
            // Buscar tokens FCM del usuario
            const user = await user_model_1.default.findById(member.user_id);
            if (user && user.fcmTokens && user.fcmTokens.length > 0) {
                await (0, firebase_service_1.sendPushNotification)(user.fcmTokens, "Depósito eliminado", description, {
                    type: "team_removed",
                    deposit_id: id
                });
            }
        }
        return deleted;
    }
}
exports.default = DeleteDepositUseCase;
