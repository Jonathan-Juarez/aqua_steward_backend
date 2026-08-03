import { Response } from "express";
import GetReadingsUseCase from "../../app/usecases/readings/get-readings.usecase";
import ExportReadingsUseCase from "../../app/usecases/readings/export-readings.usecase";
import GetReadingReportStatsUseCase from "../../app/usecases/readings/get-reading-report-stats.usecase";
import DepositRepositoryMongo from "../database/repositories/deposit-repository.mongo";
import ReadingRepositoryMongo from "../database/repositories/reading-repository.mongo";
import { AuthRequest } from "../middlewares/auth";

// Se instancian los repositorios y se inyectan al caso de uso.
const depositRepository = new DepositRepositoryMongo();
const readingRepository = new ReadingRepositoryMongo();

const getReadingsUseCase = new GetReadingsUseCase(depositRepository, readingRepository);
const exportReadingsUseCase = new ExportReadingsUseCase(depositRepository, readingRepository);
const getReadingReportStatsUseCase = new GetReadingReportStatsUseCase(readingRepository);

export class ReadingController {
    // Se obtienen las lecturas diarias, semanales o mensuales de un sensor específico.
    static async getReadings(req: AuthRequest, res: Response) {
        const depositId = String(req.params.depositId);
        const sensorType = String(req.params.sensorType);
        const filter = String(req.query.filter || "Dia");

        const readings = await getReadingsUseCase.execute({ depositId, sensorType, filter });

        return res.status(200).json(readings);
    }

    // Se exportan las lecturas en un rango de tiempo para múltiples sensores.
    static async exportReadings(req: AuthRequest, res: Response) {
        const depositId = String(req.params.depositId);
        const sensorsQuery = String(req.query.sensors || "");
        const filter = String(req.query.filter || "Dia");

        const sensorTypes = sensorsQuery ? sensorsQuery.split(",") : [];
        const readings = await exportReadingsUseCase.execute({ depositId, sensorTypes, filter });

        return res.status(200).json(readings);
    }

    // Obtiene las estadísticas de cumplimiento y las alertas para el reporte PDF.
    static async getReportStats(req: AuthRequest, res: Response) {
        const depositId = String(req.params.depositId);
        const filter = String(req.query.filter || "Dia");

        const reportStats = await getReadingReportStatsUseCase.execute(depositId, filter);

        return res.status(200).json(reportStats);
    }
}