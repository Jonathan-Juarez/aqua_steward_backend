import { INotificationRepository } from "../../../domain/repository/notification-repository.interface";

export default class DeleteNotificationUseCase {
    constructor(private notificationRepository: INotificationRepository) { }

    async execute(notificationId: string): Promise<void> {
        await this.notificationRepository.deleteNotification(notificationId);
    }
}
