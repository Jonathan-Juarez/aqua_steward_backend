import Reading from "../entities/reading";

// Contrato que define las operaciones de persistencia para las lecturas de sensores.
export default interface IReadingRepository {
    saveBucket(reading: Reading): Promise<void>;
    getTodayReadings(depositId: string, sensorId: string): Promise<{ hour: number, value: number }[]>;
    getWeeklyReadings(depositId: string, sensorId: string): Promise<{ day: number, value: number }[]>;
    getMonthlyReadings(depositId: string, sensorId: string): Promise<{ day: number, value: number }[]>;
}