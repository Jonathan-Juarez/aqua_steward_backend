import { INotificationRepository } from "../../../domain/repository/notification-repository.interface";
import { BadRequestError } from "../../../infrastructure/errors/BadRequestError";

export default class UnregisterTokenUseCase {
    constructor(private notificationRepository: INotificationRepository) { }

    async execute(userId: string, dto: { fcmToken?: string }): Promise<void> {
        if (!dto.fcmToken) {
            throw new BadRequestError("El token FCM es requerido.");
        }
        await this.notificationRepository.unregisterToken(userId, dto.fcmToken);
    }
}
