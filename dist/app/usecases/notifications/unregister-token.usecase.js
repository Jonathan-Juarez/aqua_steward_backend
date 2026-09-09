"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BadRequestError_1 = require("../../../infrastructure/errors/BadRequestError");
class UnregisterTokenUseCase {
    notificationRepository;
    constructor(notificationRepository) {
        this.notificationRepository = notificationRepository;
    }
    async execute(userId, dto) {
        if (!dto.fcmToken) {
            throw new BadRequestError_1.BadRequestError("El token FCM es requerido.");
        }
        await this.notificationRepository.unregisterToken(userId, dto.fcmToken);
    }
}
exports.default = UnregisterTokenUseCase;
