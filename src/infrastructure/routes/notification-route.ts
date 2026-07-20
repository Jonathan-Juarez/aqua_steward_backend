import { Router } from "express";
import auth from "../middlewares/auth";
import {
    registerToken,
    unregisterToken,
    getNotifications,
    deleteNotification,
    deleteAllNotifications,
    markNotificationsAsRead
} from "../controllers/notification-controller";

const router = Router();

// Rutas protegidas por autenticación
router.post("/register", auth, registerToken);
router.post("/unregister", auth, unregisterToken);

router.get("/getNotifications", auth, getNotifications);
router.delete("/deleteNotification/:id", auth, deleteNotification);
router.delete("/deleteAllNotifications", auth, deleteAllNotifications);
router.post("/read", auth, markNotificationsAsRead);

export default router;
