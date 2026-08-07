import { Router } from "express";
import auth from "../middlewares/auth";
import { NotificationController } from "../controllers/notification-controller";

const router = Router();
router.use(auth);

// Rutas protegidas por autenticación
router.post("/register", NotificationController.registerToken);
router.post("/unregister", NotificationController.unregisterToken);
router.get("/getNotifications", NotificationController.getNotifications);
router.delete("/deleteNotification/:id", NotificationController.deleteNotification);
router.delete("/deleteAllNotifications", NotificationController.deleteAllNotifications);
router.put("/markAsRead", NotificationController.markNotificationsAsRead);

export default router;
