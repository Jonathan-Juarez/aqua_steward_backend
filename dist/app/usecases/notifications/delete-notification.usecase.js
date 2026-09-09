"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DeleteNotificationUseCase {
    notificationRepository;
    constructor(notificationRepository) {
        this.notificationRepository = notificationRepository;
    }
    async execute(userId, notificationId) {
        await this.notificationRepository.deleteNotification(userId, notificationId);
    }
}
exports.default = DeleteNotificationUseCase;
