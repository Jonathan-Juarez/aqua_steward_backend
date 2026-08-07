import { Router } from "express";
import { ReadingController } from "../controllers/reading-controller";
import auth from "../middlewares/auth";

const router = Router();
router.use(auth);


// Recibe filter como parámetro de consulta: /api/reading/123id/sensor/PH-4502C?filter=Día | Semana | Mes.
router.get("/:depositId/sensor/:sensorType", ReadingController.getReadings);
// Recibe query parameters como sensors (separados por coma) y filter: /api/reading/123id/export?sensors=HC-SR04,PH-4502C&filter=Semana.
router.get("/:depositId/export", ReadingController.exportReadings);
// Obtiene estadísticas de cumplimiento y registro de alertas para el reporte PDF.
router.get("/:depositId/report-stats", ReadingController.getReportStats);

export default router;
