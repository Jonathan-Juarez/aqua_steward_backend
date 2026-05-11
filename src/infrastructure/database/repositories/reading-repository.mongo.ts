import IReadingRepository from "../../../domain/repository/reading-repository.interface";
import Reading from "../../../domain/entities/reading";
import ReadingsBucketModel from "../models/reading-model";

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

    async getTodayReadings(depositId: string, sensorId: string): Promise<{ hour: number, value: number }[]> {
        const today = new Date();
        // Día actual desde las 00:00:00 hasta las 23:59:59
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

        // Buscar los buckets para hoy
        const buckets = await ReadingsBucketModel.find({
            deposit_id: depositId as any,
            sensor_id: sensorId as any,
            date_bucket: { $gte: startOfDay, $lte: endOfDay }
        });

        // Inicializar 24 horas en 0
        const results = Array.from({ length: 24 }, (_, i) => ({ hour: i, value: 0.0 }));

        // Se calcula el promedio de las lecturas en cada bucket.
        buckets.forEach(bucket => {
            const hour = bucket.date_bucket.getHours();
            const average = bucket.count > 0 ? bucket.sum / bucket.count : 0;
            results[hour].value = parseFloat(average.toFixed(1));
        });

        return results;
    }

    async getWeeklyReadings(depositId: string, sensorId: string): Promise<{ day: number, value: number }[]> {
        const today = new Date();
        // Dia de la semana (0 = Domingo, 1 = Lunes, etc)
        const dayOfWeek = today.getDay();

        // Para tener de Domingo a Sábado: ajustamos el inicio para que sea Domingo
        const startOfWeekDate = new Date(today);
        startOfWeekDate.setDate(today.getDate() - dayOfWeek);
        startOfWeekDate.setHours(0, 0, 0, 0);

        // y el final para que sea Sábado
        const endOfWeekDate = new Date(startOfWeekDate);
        endOfWeekDate.setDate(startOfWeekDate.getDate() + 6);
        endOfWeekDate.setHours(23, 59, 59, 999);

        // Buscar los buckets para la semana
        const buckets = await ReadingsBucketModel.find({
            deposit_id: depositId as any,
            sensor_id: sensorId as any,
            date_bucket: { $gte: startOfWeekDate, $lte: endOfWeekDate }
        });

        // Inicializa un array con 7 días en 0.
        const results = Array.from({ length: 7 }, (_, i) => ({ day: i, value: 0.0 }));

        // Se agrupan los buckets por día relativo a startOfWeek.
        const dailyData: Record<number, { sum: number, count: number }> = {};
        for (let i = 0; i < 7; i++) dailyData[i] = { sum: 0, count: 0 };

        buckets.forEach(bucket => {
            // Se calcula la diferencia en días (0 - 6).
            const diffTime = bucket.date_bucket.getTime() - startOfWeekDate.getTime();
            // Se divide la diferencia por la cantidad de milisegundos en un día para obtener el índice del día.
            const dayIndex = Math.floor(diffTime / (1000 * 3600 * 24));

            // Si el índice está dentro del rango de 0 a 6, se suman las lecturas del bucket.
            if (dayIndex >= 0 && dayIndex < 7) {
                dailyData[dayIndex].sum += bucket.sum;
                dailyData[dayIndex].count += bucket.count;
            }
        });

        // Se calcula el promedio de las lecturas en cada bucket.
        for (let i = 0; i < 7; i++) {
            const average = dailyData[i].count > 0 ? dailyData[i].sum / dailyData[i].count : 0;
            results[i].value = parseFloat(average.toFixed(1));
        }

        return results;
    }

    async getMonthlyReadings(depositId: string, sensorId: string): Promise<{ day: number, value: number }[]> {
        const today = new Date();


        const startOfMonthDate = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0);

        const endOfMonthDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

        // Se obtiene el último día del mes para definir el rango de búsqueda.
        const totalDaysInMonth = endOfMonthDate.getDate();

        // Se busca el bucket por depósito, sensor y fecha.
        const buckets = await ReadingsBucketModel.find({
            deposit_id: depositId as any,
            sensor_id: sensorId as any,
            // Se define que sea mayor o igual al primer día del mes y menor o igual al último día del mes.
            date_bucket: { $gte: startOfMonthDate, $lte: endOfMonthDate }
        });

        // Se inicializa el array de resultados con el total de días del mes en 0.
        const results = Array.from({ length: totalDaysInMonth }, (_, i) => ({ day: i, value: 0.0 }));

        // Se inicializa un objeto para almacenar las lecturas por día.
        const dailyData: Record<number, { sum: number, count: number }> = {};
        // Se itera sobre el total de días del mes para inicializar el objeto.
        for (let i = 0; i < totalDaysInMonth; i++) dailyData[i] = { sum: 0, count: 0 };

        buckets.forEach(bucket => {
            // Se calcula el índice del día basado en el día del mes.
            const dayOfMonth = bucket.date_bucket.getDate();
            const dayIndex = dayOfMonth - 1;

            // Se suma el total de lecturas del bucket al día correspondiente mientras se encuentre dentro del rango.
            if (dayIndex >= 0 && dayIndex < totalDaysInMonth) {
                dailyData[dayIndex].sum += bucket.sum;
                dailyData[dayIndex].count += bucket.count;
            }
        });

        // Se calcula el promedio de las lecturas en cada bucket y se agrega al array de resultados.
        for (let i = 0; i < totalDaysInMonth; i++) {
            const average = dailyData[i].count > 0 ? dailyData[i].sum / dailyData[i].count : 0;
            results[i].value = parseFloat(average.toFixed(1));
        }

        return results;
    }
}
