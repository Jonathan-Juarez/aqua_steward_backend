import { Router, Response, NextFunction } from "express";
import auth, { AuthRequest } from "../../infrastructure/middlewares/auth";
import RegisterTokenUseCase from "../../app/usecases/notifications/register-token.usecase";
import UnregisterTokenUseCase from "../../app/usecases/notifications/unregister-token.usecase";
import GetNotificationsUseCase from "../../app/usecases/notifications/get-notifications.usecase";
import DeleteNotificationUseCase from "../../app/usecases/notifications/delete-notification.usecase";
import DeleteAllNotificationsUseCase from "../../app/usecases/notifications/delete-all-notifications.usecase";
import MarkNotificationsAsReadUseCase from "../../app/usecases/notifications/mark-read.usecase";

export interface NotificationDependencies {
    registerTokenUseCase: RegisterTokenUseCase;
    unregisterTokenUseCase: UnregisterTokenUseCase;
    getNotificationsUseCase: GetNotificationsUseCase;
    deleteNotificationUseCase: DeleteNotificationUseCase;
    deleteAllNotificationsUseCase: DeleteAllNotificationsUseCase;
    markNotificationsAsReadUseCase: MarkNotificationsAsReadUseCase;
}

export function NotificationRouter(deps: NotificationDependencies): Router {
    const router = Router();
    router.use(auth);

    // Rutas protegidas por autenticación
    router.post("/register", async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            await deps.registerTokenUseCase.execute(req.user.id, req.body);
            return res.status(200).json({});
        } catch (error) {
            next(error);
        }
    });

    router.post("/unregister", async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            await deps.unregisterTokenUseCase.execute(req.user.id, req.body);
            return res.status(200).json({});
        } catch (error) {
            next(error);
        }
    });

    router.get("/getNotifications", async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const result = await deps.getNotificationsUseCase.execute(req.user.id);
            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    });

    router.delete("/deleteNotification/:id", async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            await deps.deleteNotificationUseCase.execute(req.user.id, req.params.id as string);
            return res.status(200).json({});
        } catch (error) {
            next(error);
        }
    });

    router.delete("/deleteAllNotifications", async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            await deps.deleteAllNotificationsUseCase.execute(req.user.id);
            return res.status(200).json({});
        } catch (error) {
            next(error);
        }
    });

    router.put("/markAsRead", async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const { notificationId } = req.body;
            await deps.markNotificationsAsReadUseCase.execute(req.user.id, notificationId);
            return res.status(200).json({});
        } catch (error) {
            next(error);
        }
    });

    return router;
}

export default NotificationRouter;


