import { Router, Response, NextFunction } from "express";
import auth, { AuthRequest } from "../../infrastructure/middlewares/auth";
import GetReadingsUseCase from "../../app/usecases/readings/get-readings.usecase";
import ExportReadingsUseCase from "../../app/usecases/readings/export-readings.usecase";
import GetReadingReportStatsUseCase from "../../app/usecases/readings/get-reading-report-stats.usecase";

export interface ReadingDependencies {
    getReadingsUseCase: GetReadingsUseCase;
    exportReadingsUseCase: ExportReadingsUseCase;
    getReadingReportStatsUseCase: GetReadingReportStatsUseCase;
}

export function ReadingRouter(deps: ReadingDependencies): Router {
    const router = Router();
    router.use(auth);

    // Recibe filter como parámetro de consulta: /api/reading/123id/sensor/PH-4502C?filter=Día | Semana | Mes.
    router.get("/:depositId/sensor/:sensorType", async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const depositId = String(req.params.depositId);
            const sensorType = String(req.params.sensorType);
            const filter = String(req.query.filter || "Dia");

            const readings = await deps.getReadingsUseCase.execute({ depositId, sensorType, filter });
            return res.status(200).json(readings);
        } catch (error) {
            next(error);
        }
    });

    // Recibe query parameters como sensors (separados por coma) y filter: /api/reading/123id/export?sensors=HC-SR04,PH-4502C&filter=Semana.
    router.get("/:depositId/export", async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const depositId = String(req.params.depositId);
            const sensorsQuery = String(req.query.sensors || "");
            const filter = String(req.query.filter || "Dia");

            const sensorTypes = sensorsQuery ? sensorsQuery.split(",") : [];
            const readings = await deps.exportReadingsUseCase.execute({ depositId, sensorTypes, filter });
            return res.status(200).json(readings);
        } catch (error) {
            next(error);
        }
    });

    // Obtiene estadísticas de cumplimiento y registro de alertas para el reporte PDF.
    router.get("/:depositId/report-stats", async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const depositId = String(req.params.depositId);
            const filter = String(req.query.filter || "Dia");

            const reportStats = await deps.getReadingReportStatsUseCase.execute(depositId, filter);
            return res.status(200).json(reportStats);
        } catch (error) {
            next(error);
        }
    });

    return router;
}

export default ReadingRouter;


