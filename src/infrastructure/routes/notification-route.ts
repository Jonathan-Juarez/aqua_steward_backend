import { Router } from "express";
import auth from "../middlewares/auth";
import { NotificationController } from "../controllers/notification-controller";

const router = Router();

// Rutas protegidas por autenticación
router.post("/register", auth, NotificationController.registerToken);
router.post("/unregister", auth, NotificationController.unregisterToken);
router.get("/getNotifications", auth, NotificationController.getNotifications);
router.delete("/deleteNotification/:id", auth, NotificationController.deleteNotification);
router.delete("/deleteAllNotifications", auth, NotificationController.deleteAllNotifications);
router.put("/markAsRead", auth, NotificationController.markNotificationsAsRead);

export default router;
