import { INotificationRepository } from "../../../domain/repository/notification-repository.interface";

export default class GetNotificationsUseCase {
    constructor(private notificationRepository: INotificationRepository) { }

    async execute(userId: string): Promise<any[]> {
        return await this.notificationRepository.getNotifications(userId);
    }
}
