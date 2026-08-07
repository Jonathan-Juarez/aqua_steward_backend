import { Response } from "express";
import { AuthRequest } from "../middlewares/auth";
import NotificationRepositoryMongo from "../database/repositories/notification-repository.mongo";
import RegisterTokenUseCase from "../../app/usecases/notifications/register-token.usecase";
import UnregisterTokenUseCase from "../../app/usecases/notifications/unregister-token.usecase";
import GetNotificationsUseCase from "../../app/usecases/notifications/get-notifications.usecase";
import DeleteNotificationUseCase from "../../app/usecases/notifications/delete-notification.usecase";
import DeleteAllNotificationsUseCase from "../../app/usecases/notifications/delete-all-notifications.usecase";
import MarkNotificationsAsReadUseCase from "../../app/usecases/notifications/mark-read.usecase";

// Se inicializan el repositorio e instancias de los casos de uso para la gestión de notificaciones.
const notificationRepository = new NotificationRepositoryMongo();
const registerTokenUseCase = new RegisterTokenUseCase(notificationRepository);
const unregisterTokenUseCase = new UnregisterTokenUseCase(notificationRepository);
const getNotificationsUseCase = new GetNotificationsUseCase(notificationRepository);
const deleteNotificationUseCase = new DeleteNotificationUseCase(notificationRepository);
const deleteAllNotificationsUseCase = new DeleteAllNotificationsUseCase(notificationRepository);
const markNotificationsAsReadUseCase = new MarkNotificationsAsReadUseCase(notificationRepository);

export class NotificationController {
    static async registerToken(req: AuthRequest, res: Response) {
        await registerTokenUseCase.execute(req.user.id, req.body);
        return res.status(200).json({});
    }

    static async unregisterToken(req: AuthRequest, res: Response) {
        await unregisterTokenUseCase.execute(req.user.id, req.body);
        return res.status(200).json({});
    }

    static async getNotifications(req: AuthRequest, res: Response) {
        const result = await getNotificationsUseCase.execute(req.user.id);
        return res.status(200).json(result);
    }

    static async deleteNotification(req: AuthRequest, res: Response) {
        await deleteNotificationUseCase.execute(req.user.id, req.params.id as string);
        return res.status(200).json({});
    }

    static async deleteAllNotifications(req: AuthRequest, res: Response) {
        await deleteAllNotificationsUseCase.execute(req.user.id);
        return res.status(200).json({});
    }

    static async markNotificationsAsRead(req: AuthRequest, res: Response) {
        const { notificationId } = req.body;
        await markNotificationsAsReadUseCase.execute(req.user.id, notificationId);
        return res.status(200).json({});
    }
}
