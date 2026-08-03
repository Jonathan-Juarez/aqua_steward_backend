import { Router } from "express";
import { ReadingController } from "../controllers/reading-controller";
import auth from "../middlewares/auth";

const router = Router();

// Recibe filter como parámetro de consulta: /api/reading/123id/sensor/PH-4502C?filter=Día | Semana | Mes.
router.get("/:depositId/sensor/:sensorType", auth, ReadingController.getReadings);
// Recibe query parameters como sensors (separados por coma) y filter: /api/reading/123id/export?sensors=HC-SR04,PH-4502C&filter=Semana.
router.get("/:depositId/export", auth, ReadingController.exportReadings);
// Obtiene estadísticas de cumplimiento y registro de alertas para el reporte PDF.
router.get("/:depositId/report-stats", auth, ReadingController.getReportStats);

export default router;
