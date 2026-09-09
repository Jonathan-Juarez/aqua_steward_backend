"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MarkNotificationsAsReadUseCase {
    notificationRepository;
    constructor(notificationRepository) {
        this.notificationRepository = notificationRepository;
    }
    async execute(userId, notificationId) {
        await this.notificationRepository.markNotificationAsRead(userId, notificationId);
    }
}
exports.default = MarkNotificationsAsReadUseCase;
