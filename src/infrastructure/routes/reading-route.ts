import { Router } from "express";
import { getReadings, exportReadings } from "../controllers/reading-controller";
import auth from "../middlewares/auth";

const router = Router();

// Recibe filter como parámetro de consulta: /api/reading/123/sensor/PH-4502C?filter=Día | Semana | Mes.
router.get("/:depositId/sensor/:sensorType", auth, getReadings);

// Recibe query parameters como sensors (separados por coma) y filter: /api/reading/123/export?sensors=HC-SR04,PH-4502C&filter=Semana.
router.get("/:depositId/export", auth, exportReadings);

export default router;
