import Reading from "../entities/reading";

export interface ExportedReading {
    timestamp: Date;
    value: number;
    unit: string;
    sensorType: string;
    depositName: string;
}

export interface ComplianceStat {
    sensorType: string;
    percentage: number;
    totalReadings: number;
    inRange: number;
}

export interface ReportAlertItem {
    id: string;
    date: Date;
    type: string;
    description: string;
    triggerValue?: number;
}

export interface ReportAlertsResult {
    totalAlerts: number;
    countByType: Record<string, number>;
    alerts: ReportAlertItem[];
}

// Contrato que define las operaciones de persistencia para las lecturas de sensores.
export default interface IReadingRepository {
    saveBucket(reading: Reading): Promise<void>;
    getTodayReadings(depositId: string, sensorId: string): Promise<{ hour: number, value: number }[]>;
    getWeeklyReadings(depositId: string, sensorId: string): Promise<{ day: number, value: number }[]>;
    getMonthlyReadings(depositId: string, sensorId: string): Promise<{ day: number, value: number }[]>;
    exportReadings(depositId: string, sensorIds: string[], filter: string): Promise<ExportedReading[]>;
    getComplianceStats(depositId: string, filter: string): Promise<ComplianceStat[]>;
    getReportAlerts(depositId: string, filter: string): Promise<ReportAlertsResult>;
}