import { INotificationRepository } from "../../../domain/repository/notification-repository.interface";

export default class DeleteAllNotificationsUseCase {
    constructor(private notificationRepository: INotificationRepository) { }

    async execute(userId: string): Promise<void> {
        await this.notificationRepository.deleteAllNotifications(userId);
    }
}
