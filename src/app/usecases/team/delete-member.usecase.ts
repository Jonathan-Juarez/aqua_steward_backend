import { ITeamRepository } from "../../../domain/repository/team-repository.interface";
import { IAuthRepository } from "../../../domain/repository/auth-repository.interface";
import { IDepositRepository } from "../../../domain/repository/deposit-repository.interface";
import { DeleteMemberDTO } from "../../dtos/team.dto";
import { BadRequestError } from "../../../infrastructure/errors/BadRequestError";
import { NotFoundError } from "../../../infrastructure/errors/NotFoundError";
import { sendPushNotification } from "../../../infrastructure/services/firebase.service";
import NotificationModel from "../../../infrastructure/database/models/notification-model";

export class DeleteMemberUseCase {
    constructor(
        private teamRepository: ITeamRepository,
        private authRepository: IAuthRepository,
        private depositRepository: IDepositRepository
    ) { }

    async execute(dto: DeleteMemberDTO): Promise<void> {
        if (!dto.deposit_id || !dto.user_id) {
            throw new BadRequestError("No se proporcionó el depósito o el usuario para eliminar el miembro");
        }

        const user = await this.authRepository.findById(dto.user_id);
        if (!user) {
            throw new BadRequestError("No se encontró ningún usuario con el ID proporcionado");
        }

        const assignmentIndex = user.assigned_deposits?.findIndex(assigned => assigned.deposit_id?.toString() === dto.deposit_id);
        if (assignmentIndex === undefined || assignmentIndex === -1) {
            throw new NotFoundError("El miembro a eliminar no se encuentra en el equipo");
        }

        await this.teamRepository.delete(dto.deposit_id, dto.user_id);

        // Obtener información del depósito para la notificación
        const deposit = await this.depositRepository.findById(dto.deposit_id);
        const depositName = deposit ? deposit.name : "un depósito";
        const description = `Has sido removido del depósito "${depositName}".`;

        // Guardar notificación en la base de datos asociada al usuario afectado
        const notification = new NotificationModel({
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
            await sendPushNotification(
                user.fcmTokens,
                "Removido del equipo",
                description,
                {
                    type: "team_removed",
                    deposit_id: dto.deposit_id
                }
            );
        }
    }
}
