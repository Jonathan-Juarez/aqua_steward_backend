"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("../middlewares/auth"));
const notification_controller_1 = require("../controllers/notification-controller");
const router = (0, express_1.Router)();
router.use(auth_1.default);
// Rutas protegidas por autenticación
router.post("/register", notification_controller_1.NotificationController.registerToken);
router.post("/unregister", notification_controller_1.NotificationController.unregisterToken);
router.get("/getNotifications", notification_controller_1.NotificationController.getNotifications);
router.delete("/deleteNotification/:id", notification_controller_1.NotificationController.deleteNotification);
router.delete("/deleteAllNotifications", notification_controller_1.NotificationController.deleteAllNotifications);
router.put("/markAsRead", notification_controller_1.NotificationController.markNotificationsAsRead);
exports.default = router;
