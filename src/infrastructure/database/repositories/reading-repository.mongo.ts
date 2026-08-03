import IReadingRepository, { ExportedReading, ComplianceStat, ReportAlertItem, ReportAlertsResult } from "../../../domain/repository/reading-repository.interface";
import Reading from "../../../domain/entities/reading";
import ReadingsBucketModel from "../models/reading-model";
import DepositsModel from "../models/deposit-model";
import { Types } from "mongoose";
import { roundTo1Decimal, formatCleanNumber } from "../../../domain/utils/number-utils";
import { getDateRangeFromFilter } from "../../../domain/utils/date-utils";
import { evaluateThreshold } from "../../../domain/utils/threshold-utils";

// Implementación del repositorio de lecturas usando el bucket pattern en MongoDB.
export default class ReadingRepositoryMongo implements IReadingRepository {

    // Se agrupa la lectura en un bucket por hora.
    async saveBucket(reading: Reading): Promise<void> {
        const dateBucket = new Date(
            reading.date.getFullYear(),
            reading.date.getMonth(),
            reading.date.getDate(),
            reading.date.getHours()
        );

        await ReadingsBucketModel.findOneAndUpdate(
            {
                sensor_id: reading.metadata.sensor_id,
                deposit_id: reading.metadata.deposits_id,
                date_bucket: dateBucket
            },
            {
                // Se agrega la lectura al bucket.
                $push: { readings: { timestamp: reading.date, value: reading.value } },
                // Se incrementa el contador de lecturas.
                $inc: { count: 1, sum: reading.value }
            },
            // Si no existe el bucket, se crea.
            { upsert: true }
        );
    }

    // Permite consultar las lecturas diarias de un sensor específico.
    async getTodayReadings(depositId: string, sensorId: string): Promise<{ hour: number, value: number }[]> {
        const sensorObjectId = new Types.ObjectId(sensorId);
        const depositObjectId = new Types.ObjectId(depositId);
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        // Se inicializan los 24 slots del día en 0.
        const results = Array.from({ length: 24 }, (_, i) => ({ hour: i, value: 0 }));

        // Se obtienen todos los buckets del día actual.
        const buckets = await ReadingsBucketModel.find({
            sensor_id: sensorObjectId,
            deposit_id: depositObjectId,
            date_bucket: { $gte: startOfDay, $lte: endOfDay }
        });

        // Se agrupa por hora del día.
        buckets.forEach(bucket => {
            const hour = bucket.date_bucket.getHours();
            const average = bucket.count > 0 ? bucket.sum / bucket.count : 0;
            results[hour].value = parseFloat(average.toFixed(1));
        });

        return results;
    }

    // Permite consultar las lecturas semanales de un sensor específico.
    async getWeeklyReadings(depositId: string, sensorId: string): Promise<{ day: number, value: number }[]> {
        const sensorObjectId = new Types.ObjectId(sensorId);
        const depositObjectId = new Types.ObjectId(depositId);

        const today = new Date();
        const dayOfWeek = today.getDay();

        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - dayOfWeek);
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        const dailyData: { sum: number; count: number }[] = Array.from({ length: 7 }, () => ({ sum: 0, count: 0 }));

        const buckets = await ReadingsBucketModel.find({
            sensor_id: sensorObjectId,
            deposit_id: depositObjectId,
            date_bucket: { $gte: startOfWeek, $lte: endOfWeek }
        });

        buckets.forEach(bucket => {
            const dayIndex = bucket.date_bucket.getDay();
            dailyData[dayIndex].sum += bucket.sum;
            dailyData[dayIndex].count += bucket.count;
        });

        const results = Array.from({ length: 7 }, (_, i) => ({ day: i, value: 0 }));
        for (let i = 0; i < 7; i++) {
            const average = dailyData[i].count > 0 ? dailyData[i].sum / dailyData[i].count : 0;
            results[i].value = parseFloat(average.toFixed(1));
        }

        return results;
    }

    // Permite consultar las lecturas mensuales de un sensor específico.
    async getMonthlyReadings(depositId: string, sensorId: string): Promise<{ day: number, value: number }[]> {
        const sensorObjectId = new Types.ObjectId(sensorId);
        const depositObjectId = new Types.ObjectId(depositId);

        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();

        // Primer día del mes a las 00:00:00.
        const startOfMonth = new Date(year, month, 1, 0, 0, 0, 0);
        // Último día del mes a las 23:59:59.
        const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);
        const totalDaysInMonth = endOfMonth.getDate();

        // Se inicializa el array con la cantidad exacta de días del mes.
        const dailyData: { sum: number; count: number }[] = Array.from(
            { length: totalDaysInMonth },
            () => ({ sum: 0, count: 0 })
        );

        // Se buscan todos los buckets dentro del rango del mes.
        const buckets = await ReadingsBucketModel.find({
            sensor_id: sensorObjectId,
            deposit_id: depositObjectId,
            date_bucket: { $gte: startOfMonth, $lte: endOfMonth }
        });

        // Se acumula la suma y el conteo por día del mes.
        buckets.forEach(bucket => {
            const dayIndex = bucket.date_bucket.getDate() - 1;
            if (dayIndex >= 0 && dayIndex < totalDaysInMonth) {
                dailyData[dayIndex].sum += bucket.sum;
                dailyData[dayIndex].count += bucket.count;
            }
        });

        const results = Array.from({ length: totalDaysInMonth }, (_, i) => ({
            day: i + 1,
            value: 0
        }));

        // Se calcula el promedio de las lecturas en cada bucket y se agrega al array de resultados.
        for (let i = 0; i < totalDaysInMonth; i++) {
            const average = dailyData[i].count > 0 ? dailyData[i].sum / dailyData[i].count : 0;
            results[i].value = parseFloat(average.toFixed(1));
        }

        return results;
    }

    // Permite exportar las lecturas de los sensores seleccionados.
    async exportReadings(depositId: string, sensorIds: string[], filter: string): Promise<ExportedReading[]> {
        const sensorObjectIds = sensorIds.map(id => new Types.ObjectId(id));
        const depositObjectId = new Types.ObjectId(depositId);
        const { startDate, endDate } = getDateRangeFromFilter(filter);

        const results = await ReadingsBucketModel.aggregate([
            {
                $match: {
                    deposit_id: depositObjectId,
                    sensor_id: { $in: sensorObjectIds },
                    date_bucket: { $gte: startDate, $lte: endDate }
                }
            },
            { $unwind: "$readings" },
            {
                $lookup: {
                    from: "deposits",
                    localField: "deposit_id",
                    foreignField: "_id",
                    as: "deposit"
                }
            },
            { $unwind: "$deposit" },
            {
                $project: {
                    timestamp: "$readings.timestamp",
                    value: "$readings.value",
                    depositName: "$deposit.name",
                    sensor: {
                        $filter: {
                            input: "$deposit.sensors",
                            as: "s",
                            cond: { $eq: ["$$s._id", "$sensor_id"] }
                        }
                    }
                }
            },
            { $unwind: "$sensor" },
            {
                $project: {
                    _id: 0,
                    timestamp: 1,
                    value: 1,
                    unit: "$sensor.unit",
                    sensorType: "$sensor.type",
                    depositName: 1
                }
            },
            { $sort: { timestamp: 1 } }
        ]);

        return results;
    }

    async getComplianceStats(depositId: string, filter: string): Promise<ComplianceStat[]> {
        const depositObjectId = new Types.ObjectId(depositId);
        const deposit = await DepositsModel.findById(depositObjectId).lean();
        if (!deposit || !deposit.sensors) return [];

        const { startDate, endDate } = getDateRangeFromFilter(filter);
        const statsList: ComplianceStat[] = [];

        for (const sensor of deposit.sensors) {
            if (!sensor._id || !sensor.state) continue;
            const sensorObjectId = new Types.ObjectId(sensor._id);
            const minVal = sensor.min_value;
            const maxVal = sensor.max_value;

            const buckets = await ReadingsBucketModel.find({
                deposit_id: depositObjectId,
                sensor_id: sensorObjectId,
                date_bucket: { $gte: startDate, $lte: endDate }
            }).lean();

            let totalReadings = 0;
            let inRange = 0;

            for (const bucket of buckets) {
                if (bucket.readings) {
                    for (const r of bucket.readings) {
                        totalReadings++;
                        const evaluation = evaluateThreshold(r.value, minVal, maxVal);
                        if (!evaluation.isTriggered) inRange++;
                    }
                }
            }

            const percentage = totalReadings > 0 ? parseFloat(((inRange / totalReadings) * 100).toFixed(1)) : 100.0;

            statsList.push({
                sensorType: sensor.type,
                percentage,
                totalReadings,
                inRange
            });
        }

        return statsList;
    }

    async getReportAlerts(depositId: string, filter: string): Promise<ReportAlertsResult> {
        const depositObjectId = new Types.ObjectId(depositId);
        const deposit = await DepositsModel.findById(depositObjectId).lean();

        const countByType: Record<string, number> = {
            "Nivel": 0,
            "pH": 0,
            "Turbidez": 0
        };

        if (!deposit || !deposit.sensors) {
            return { totalAlerts: 0, countByType, alerts: [] };
        }

        const { startDate, endDate } = getDateRangeFromFilter(filter);
        const alerts: ReportAlertItem[] = [];
        const lastAlertTimeMap: Record<string, number> = {};
        const COOLDOWN_TIME = 5 * 60 * 1000; // 5 minutos entre alertas por sensor

        for (const sensor of deposit.sensors) {
            if (!sensor._id || !sensor.state) continue; // Ignorar sensores inactivos

            const sensorObjectId = new Types.ObjectId(sensor._id);
            const sensorTypeCategory = sensor.type === "PH-4502C" ? "pH" : (sensor.type === "TS300B" ? "Turbidez" : "Nivel");
            const minVal = sensor.min_value;
            const maxVal = sensor.max_value;

            const buckets = await ReadingsBucketModel.find({
                deposit_id: depositObjectId,
                sensor_id: sensorObjectId,
                date_bucket: { $gte: startDate, $lte: endDate }
            }).sort({ date_bucket: 1 }).lean();

            for (const bucket of buckets) {
                if (bucket.readings) {
                    for (const r of bucket.readings) {
                        const evaluation = evaluateThreshold(r.value, minVal, maxVal, deposit.name, sensor.unit || "");

                        if (evaluation.isTriggered) {
                            const rDate = new Date(r.timestamp);
                            const rTime = rDate.getTime();
                            const lastTime = lastAlertTimeMap[sensor.type] || 0;

                            if (rTime - lastTime >= COOLDOWN_TIME) {
                                lastAlertTimeMap[sensor.type] = rTime;
                                countByType[sensorTypeCategory] = (countByType[sensorTypeCategory] || 0) + 1;
                                alerts.push({
                                    id: (r as any)._id?.toString() || `${rTime}`,
                                    date: rDate,
                                    type: sensorTypeCategory,
                                    description: evaluation.message,
                                    triggerValue: evaluation.triggerValue
                                });
                            }
                        }
                    }
                }
            }
        }

        // Ordenar alertas por fecha descendente
        alerts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return {
            totalAlerts: alerts.length,
            countByType,
            alerts
        };
    }
}
