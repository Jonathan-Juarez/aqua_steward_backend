import { Router } from "express";
import { getReadings } from "../controllers/reading-controller";
import auth from "../middlewares/auth";

const router = Router();

// Recibe filter como parámetro de consulta: /api/reading/123/sensor/PH-4502C?filter=Día | Semana | Mes.
router.get("/:depositId/sensor/:sensorType", auth, getReadings);

export default router;
