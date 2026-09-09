"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadingController = void 0;
const get_readings_usecase_1 = __importDefault(require("../../app/usecases/readings/get-readings.usecase"));
const export_readings_usecase_1 = __importDefault(require("../../app/usecases/readings/export-readings.usecase"));
const get_reading_report_stats_usecase_1 = __importDefault(require("../../app/usecases/readings/get-reading-report-stats.usecase"));
const deposit_repository_mongo_1 = __importDefault(require("../database/repositories/deposit-repository.mongo"));
const reading_repository_mongo_1 = __importDefault(require("../database/repositories/reading-repository.mongo"));
// Se instancian los repositorios y se inyectan al caso de uso.
const depositRepository = new deposit_repository_mongo_1.default();
const readingRepository = new reading_repository_mongo_1.default();
const getReadingsUseCase = new get_readings_usecase_1.default(depositRepository, readingRepository);
const exportReadingsUseCase = new export_readings_usecase_1.default(depositRepository, readingRepository);
const getReadingReportStatsUseCase = new get_reading_report_stats_usecase_1.default(readingRepository);
class ReadingController {
    // Se obtienen las lecturas diarias, semanales o mensuales de un sensor específico.
    static async getReadings(req, res) {
        const depositId = String(req.params.depositId);
        const sensorType = String(req.params.sensorType);
        const filter = String(req.query.filter || "Dia");
        const readings = await getReadingsUseCase.execute({ depositId, sensorType, filter });
        return res.status(200).json(readings);
    }
    // Se exportan las lecturas en un rango de tiempo para múltiples sensores.
    static async exportReadings(req, res) {
        const depositId = String(req.params.depositId);
        const sensorsQuery = String(req.query.sensors || "");
        const filter = String(req.query.filter || "Dia");
        const sensorTypes = sensorsQuery ? sensorsQuery.split(",") : [];
        const readings = await exportReadingsUseCase.execute({ depositId, sensorTypes, filter });
        return res.status(200).json(readings);
    }
    // Obtiene las estadísticas de cumplimiento y las alertas para el reporte PDF.
    static async getReportStats(req, res) {
        const depositId = String(req.params.depositId);
        const filter = String(req.query.filter || "Dia");
        const reportStats = await getReadingReportStatsUseCase.execute(depositId, filter);
        return res.status(200).json(reportStats);
    }
}
exports.ReadingController = ReadingController;
