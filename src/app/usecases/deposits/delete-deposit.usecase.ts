import Deposit from "../../../domain/entities/deposit";
import { IDepositRepository } from "../../../domain/repository/deposit-repository.interface";
import { ITeamRepository } from "../../../domain/repository/team-repository.interface";
import { BadRequestError } from "../../../infrastructure/errors/BadRequestError";
import { sendPushNotification } from "../../../infrastructure/services/firebase.service";
import NotificationModel from "../../../infrastructure/database/models/notification-model";
import UserModel from "../../../infrastructure/database/models/user-model";

export default class DeleteDepositUseCase {
    constructor(
        private depositRepository: IDepositRepository,
        private teamRepository: ITeamRepository
    ) { }

    async execute(id: string): Promise<Deposit | null> {
        if (!id) throw new BadRequestError("No se encontró el depósito a eliminar");
        
        const deposit = await this.depositRepository.findById(id);
        if (!deposit) return null;

        // Obtener miembros del equipo para enviarles la notificación
        const team = await this.teamRepository.getTeam(id);

        const deleted = await this.depositRepository.delete(id);

        // Desvincular este depósito de la lista de todos los usuarios
        await UserModel.updateMany(
            { "assigned_deposits.deposit_id": id },
            { $pull: { assigned_deposits: { deposit_id: id } } }
        );

        // Enviar push y guardar notificación en base de datos para los miembros del equipo (excluyendo el owner)
        for (const member of team) {
            if (member.user_id === deposit.owner_id) continue;

            const description = `El depósito "${deposit.name}" ha sido eliminado por su propietario.`;

            // Guardar en base de datos
            const notification = new NotificationModel({
                generation_date: new Date(),
                state: "activa",
                title: "Equipo",
                type: "team_removed",
                description,
                user_id: member.user_id
            });
            await notification.save();

            // Buscar tokens FCM del usuario
            const user = await UserModel.findById(member.user_id);
            if (user && user.fcmTokens && user.fcmTokens.length > 0) {
                await sendPushNotification(
                    user.fcmTokens,
                    "Depósito eliminado",
                    description,
                    {
                        type: "team_removed",
                        deposit_id: id
                    }
                );
            }
        }

        return deleted;
    }
}
