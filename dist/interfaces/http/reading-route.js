"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadingRouter = ReadingRouter;
const express_1 = require("express");
const auth_1 = __importDefault(require("../../infrastructure/middlewares/auth"));
function ReadingRouter(deps) {
    const router = (0, express_1.Router)();
    router.use(auth_1.default);
    // Recibe filter como parámetro de consulta: /api/reading/123id/sensor/PH-4502C?filter=Día | Semana | Mes.
    router.get("/:depositId/sensor/:sensorType", async (req, res, next) => {
        try {
            const depositId = String(req.params.depositId);
            const sensorType = String(req.params.sensorType);
            const filter = String(req.query.filter || "Dia");
            const readings = await deps.getReadingsUseCase.execute({ depositId, sensorType, filter });
            return res.status(200).json(readings);
        }
        catch (error) {
            next(error);
        }
    });
    // Recibe query parameters como sensors (separados por coma) y filter: /api/reading/123id/export?sensors=HC-SR04,PH-4502C&filter=Semana.
    router.get("/:depositId/export", async (req, res, next) => {
        try {
            const depositId = String(req.params.depositId);
            const sensorsQuery = String(req.query.sensors || "");
            const filter = String(req.query.filter || "Dia");
            const sensorTypes = sensorsQuery ? sensorsQuery.split(",") : [];
            const readings = await deps.exportReadingsUseCase.execute({ depositId, sensorTypes, filter });
            return res.status(200).json(readings);
        }
        catch (error) {
            next(error);
        }
    });
    // Obtiene estadísticas de cumplimiento y registro de alertas para el reporte PDF.
    router.get("/:depositId/report-stats", async (req, res, next) => {
        try {
            const depositId = String(req.params.depositId);
            const filter = String(req.query.filter || "Dia");
            const reportStats = await deps.getReadingReportStatsUseCase.execute(depositId, filter);
            return res.status(200).json(reportStats);
        }
        catch (error) {
            next(error);
        }
    });
    return router;
}
exports.default = ReadingRouter;
