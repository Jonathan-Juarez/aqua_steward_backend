"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const notification_repository_mongo_1 = __importDefault(require("../database/repositories/notification-repository.mongo"));
const register_token_usecase_1 = __importDefault(require("../../app/usecases/notifications/register-token.usecase"));
const unregister_token_usecase_1 = __importDefault(require("../../app/usecases/notifications/unregister-token.usecase"));
const get_notifications_usecase_1 = __importDefault(require("../../app/usecases/notifications/get-notifications.usecase"));
const delete_notification_usecase_1 = __importDefault(require("../../app/usecases/notifications/delete-notification.usecase"));
const delete_all_notifications_usecase_1 = __importDefault(require("../../app/usecases/notifications/delete-all-notifications.usecase"));
const mark_read_usecase_1 = __importDefault(require("../../app/usecases/notifications/mark-read.usecase"));
// Se inicializan el repositorio e instancias de los casos de uso para la gestión de notificaciones.
const notificationRepository = new notification_repository_mongo_1.default();
const registerTokenUseCase = new register_token_usecase_1.default(notificationRepository);
const unregisterTokenUseCase = new unregister_token_usecase_1.default(notificationRepository);
const getNotificationsUseCase = new get_notifications_usecase_1.default(notificationRepository);
const deleteNotificationUseCase = new delete_notification_usecase_1.default(notificationRepository);
const deleteAllNotificationsUseCase = new delete_all_notifications_usecase_1.default(notificationRepository);
const markNotificationsAsReadUseCase = new mark_read_usecase_1.default(notificationRepository);
class NotificationController {
    static async registerToken(req, res) {
        await registerTokenUseCase.execute(req.user.id, req.body);
        return res.status(200).json({});
    }
    static async unregisterToken(req, res) {
        await unregisterTokenUseCase.execute(req.user.id, req.body);
        return res.status(200).json({});
    }
    static async getNotifications(req, res) {
        const result = await getNotificationsUseCase.execute(req.user.id);
        return res.status(200).json(result);
    }
    static async deleteNotification(req, res) {
        await deleteNotificationUseCase.execute(req.user.id, req.params.id);
        return res.status(200).json({});
    }
    static async deleteAllNotifications(req, res) {
        await deleteAllNotificationsUseCase.execute(req.user.id);
        return res.status(200).json({});
    }
    static async markNotificationsAsRead(req, res) {
        const { notificationId } = req.body;
        await markNotificationsAsReadUseCase.execute(req.user.id, notificationId);
        return res.status(200).json({});
    }
}
exports.NotificationController = NotificationController;
