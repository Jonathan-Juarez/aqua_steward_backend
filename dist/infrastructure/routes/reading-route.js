"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reading_controller_1 = require("../controllers/reading-controller");
const auth_1 = __importDefault(require("../middlewares/auth"));
const router = (0, express_1.Router)();
router.use(auth_1.default);
// Recibe filter como parámetro de consulta: /api/reading/123id/sensor/PH-4502C?filter=Día | Semana | Mes.
router.get("/:depositId/sensor/:sensorType", reading_controller_1.ReadingController.getReadings);
// Recibe query parameters como sensors (separados por coma) y filter: /api/reading/123id/export?sensors=HC-SR04,PH-4502C&filter=Semana.
router.get("/:depositId/export", reading_controller_1.ReadingController.exportReadings);
// Obtiene estadísticas de cumplimiento y registro de alertas para el reporte PDF.
router.get("/:depositId/report-stats", reading_controller_1.ReadingController.getReportStats);
exports.default = router;
