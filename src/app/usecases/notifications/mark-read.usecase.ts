import { INotificationRepository } from "../../../domain/repository/notification-repository.interface";

export default class MarkNotificationsAsReadUseCase {
    constructor(private notificationRepository: INotificationRepository) { }

    async execute(userId: string): Promise<void> {
        await this.notificationRepository.markNotificationAsRead(userId);
    }
}
