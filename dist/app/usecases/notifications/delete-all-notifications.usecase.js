"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DeleteAllNotificationsUseCase {
    notificationRepository;
    constructor(notificationRepository) {
        this.notificationRepository = notificationRepository;
    }
    async execute(userId) {
        await this.notificationRepository.deleteAllNotifications(userId);
    }
}
exports.default = DeleteAllNotificationsUseCase;
