import IReadingRepository, { ComplianceStat, ReportAlertsResult } from "../../../domain/repository/reading-repository.interface";

export interface ReadingReportStatsResult {
    compliance: ComplianceStat[];
    alerts: ReportAlertsResult;
}

export default class GetReadingReportStatsUseCase {
    constructor(private readingRepository: IReadingRepository) { }

    async execute(depositId: string, filter: string): Promise<ReadingReportStatsResult> {
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
