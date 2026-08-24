"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class GetReadingReportStatsUseCase {
    readingRepository;
    constructor(readingRepository) {
        this.readingRepository = readingRepository;
    }
    async execute(depositId, filter) {
        const [compliance, alerts] = await Promise.all([
            // Obtiene las estadísticas de cumplimiento.
            this.readingRepository.getComplianceStats(depositId, filter),
            // Obtiene las alertas.
            this.readingRepository.getReportAlerts(depositId, filter)
        ]);
        return {
            compliance,
            alerts
        };
    }
}
exports.default = GetReadingReportStatsUseCase;
