import { Response } from "express";
import { AuthRequest } from "../middlewares/auth";
import NotificationRepositoryMongo from "../database/repositories/notification-repository.mongo";
import RegisterTokenUseCase from "../../app/usecases/notifications/register-token.usecase";
import UnregisterTokenUseCase from "../../app/usecases/notifications/unregister-token.usecase";
import GetNotificationsUseCase from "../../app/usecases/notifications/get-notifications.usecase";
import DeleteNotificationUseCase from "../../app/usecases/notifications/delete-notification.usecase";
import DeleteAllNotificationsUseCase from "../../app/usecases/notifications/delete-all-notifications.usecase";
import MarkNotificationsAsReadUseCase from "../../app/usecases/notifications/mark-read.usecase";

// Se instancian las dependencias una sola vez
const notificationRepository = new NotificationRepositoryMongo();
const registerTokenUseCase = new RegisterTokenUseCase(notificationRepository);
const unregisterTokenUseCase = new UnregisterTokenUseCase(notificationRepository);
const getNotificationsUseCase = new GetNotificationsUseCase(notificationRepository);
const deleteNotificationUseCase = new DeleteNotificationUseCase(notificationRepository);
const deleteAllNotificationsUseCase = new DeleteAllNotificationsUseCase(notificationRepository);
const markNotificationsAsReadUseCase = new MarkNotificationsAsReadUseCase(notificationRepository);

export const registerToken = async (req: AuthRequest, res: Response): Promise<Response | void> => {
    await registerTokenUseCase.execute(req.user.id, req.body);
    return res.status(200).json({});
};

export const unregisterToken = async (req: AuthRequest, res: Response): Promise<Response | void> => {
    await unregisterTokenUseCase.execute(req.user.id, req.body);
    return res.status(200).json({});
};

export const getNotifications = async (req: AuthRequest, res: Response): Promise<Response | void> => {
    const result = await getNotificationsUseCase.execute(req.user.id);
    return res.status(200).json(result);
};

export const deleteNotification = async (req: AuthRequest, res: Response): Promise<Response | void> => {
    await deleteNotificationUseCase.execute(req.params.id as string);
    return res.status(200).json({});
};

export const deleteAllNotifications = async (req: AuthRequest, res: Response): Promise<Response | void> => {
    await deleteAllNotificationsUseCase.execute(req.user.id);
    return res.status(200).json({});
};

export const markNotificationsAsRead = async (req: AuthRequest, res: Response): Promise<Response | void> => {
    await markNotificationsAsReadUseCase.execute(req.user.id);
    return res.status(200).json({});
};
