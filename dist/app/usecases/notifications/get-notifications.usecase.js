"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class GetNotificationsUseCase {
    notificationRepository;
    constructor(notificationRepository) {
        this.notificationRepository = notificationRepository;
    }
    async execute(userId) {
        return await this.notificationRepository.getNotifications(userId);
    }
}
exports.default = GetNotificationsUseCase;
