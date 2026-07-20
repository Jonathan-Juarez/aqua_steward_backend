import { ITeamRepository } from "../../../domain/repository/team-repository.interface";
import { IAuthRepository } from "../../../domain/repository/auth-repository.interface";
import { IDepositRepository } from "../../../domain/repository/deposit-repository.interface";
import TeamMember from "../../../domain/entities/team";
import { UpdateMemberDTO } from "../../dtos/team.dto";
import { BadRequestError } from "../../../infrastructure/errors/BadRequestError";
import { sendPushNotification } from "../../../infrastructure/services/firebase.service";
import NotificationModel from "../../../infrastructure/database/models/notification-model";

export class UpdateMemberUseCase {
    constructor(
        private teamRepository: ITeamRepository,
        private authRepository: IAuthRepository,
        private depositRepository: IDepositRepository
    ) { }

    async execute(dto: UpdateMemberDTO): Promise<TeamMember> {
        if (!dto.deposit_id || !dto.user_id || !dto.role) {
            throw new BadRequestError("No se proporcionó el depósito, el usuario o el rol para actualizar el miembro");
        }

        const user = await this.authRepository.findById(dto.user_id);
        if (!user) {
            throw new BadRequestError("No se proporcionó el ID del usuario para actualizar el miembro");
        }

        const assignmentDeposit = user.assigned_deposits?.find((assigned: any) => assigned.deposit_id === dto.deposit_id || assigned.deposit_id?.toString() === dto.deposit_id);

        if (!assignmentDeposit || assignmentDeposit.status !== "accepted") {
            throw new BadRequestError("No se puede actualizar al miembro porque su invitación no ha sido aceptada");
        }

        const updatedMember = await this.teamRepository.update(dto.deposit_id, dto.user_id, dto.role);
        if (!updatedMember) throw new BadRequestError("No se pudo actualizar al miembro");

        // Obtener información del depósito para la notificación
        const deposit = await this.depositRepository.findById(dto.deposit_id);
        const depositName = deposit ? deposit.name : "un depósito";

        const roleLabels: Record<string, string> = {
            admin: "Administrador",
            analyst: "Analista",
            technician: "Técnico"
        };
        const roleLabel = roleLabels[dto.role] || dto.role;
        const description = `Tu rol en el depósito "${depositName}" ha sido actualizado a ${roleLabel}.`;

        // Guardar notificación en la base de datos asociada al usuario afectado
        const notification = new NotificationModel({
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
            await sendPushNotification(
                user.fcmTokens,
                "Cambio de rol",
                description,
                {
                    type: "team_role_changed",
                    deposit_id: dto.deposit_id
                }
            );
        }

        return updatedMember;
    }
}
