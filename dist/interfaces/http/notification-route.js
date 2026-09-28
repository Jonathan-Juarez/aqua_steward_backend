"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRouter = NotificationRouter;
const express_1 = require("express");
const auth_1 = __importDefault(require("../../infrastructure/middlewares/auth"));
function NotificationRouter(deps) {
    const router = (0, express_1.Router)();
    router.use(auth_1.default);
    // Rutas protegidas por autenticación
    router.post("/register", async (req, res, next) => {
        try {
            await deps.registerTokenUseCase.execute(req.user.id, req.body);
            return res.status(200).json({});
        }
        catch (error) {
            next(error);
        }
    });
    router.post("/unregister", async (req, res, next) => {
        try {
            await deps.unregisterTokenUseCase.execute(req.user.id, req.body);
            return res.status(200).json({});
        }
        catch (error) {
            next(error);
        }
    });
    router.get("/getNotifications", async (req, res, next) => {
        try {
            const result = await deps.getNotificationsUseCase.execute(req.user.id);
            return res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    });
    router.delete("/deleteNotification/:id", async (req, res, next) => {
        try {
            await deps.deleteNotificationUseCase.execute(req.user.id, req.params.id);
            return res.status(200).json({});
        }
        catch (error) {
            next(error);
        }
    });
    router.delete("/deleteAllNotifications", async (req, res, next) => {
        try {
            await deps.deleteAllNotificationsUseCase.execute(req.user.id);
            return res.status(200).json({});
        }
        catch (error) {
            next(error);
        }
    });
    router.put("/markAsRead", async (req, res, next) => {
        try {
            const { notificationId } = req.body;
            await deps.markNotificationsAsReadUseCase.execute(req.user.id, notificationId);
            return res.status(200).json({});
        }
        catch (error) {
            next(error);
        }
    });
    return router;
}
exports.default = NotificationRouter;
