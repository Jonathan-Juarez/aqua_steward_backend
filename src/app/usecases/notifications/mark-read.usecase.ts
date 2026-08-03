import { INotificationRepository } from "../../../domain/repository/notification-repository.interface";

export default class MarkNotificationsAsReadUseCase {
    constructor(private notificationRepository: INotificationRepository) { }

    async execute(userId: string, notificationId?: string): Promise<void> {
        await this.notificationRepository.markNotificationAsRead(userId, notificationId);
    }
}
