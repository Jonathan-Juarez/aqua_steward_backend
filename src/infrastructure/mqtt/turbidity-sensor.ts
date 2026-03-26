import { mqttEvents } from "./broker";
import DepositsModel from "../database/models/deposit-model";
import ReadingsBucketModel from "../database/models/reading-model";
import DepositEntity from "../../domain/entities/deposit";
import ReadingEntity from "../../domain/entities/reading";

const turbiditySensor = (io: any) => {
    console.log("Sensor TS300B activado.");

    mqttEvents.on("message_received", async ({ topic, message }: { topic: string, message: Buffer }) => {
        if (!topic.includes("/turbidez")) return;

        try {
            const parts = topic.split("/");
            const deviceIp = parts[1];
            const promedioADC = parseFloat(message.toString());

            if (isNaN(promedioADC)) return;

            // Se busca el depósito por IP
            const depositoDoc = await DepositsModel.findOne({ ip: deviceIp });
            if (!depositoDoc) {
                console.log(`Turbidez: Recibido dato de IP desconocida: ${deviceIp}`);
                return;
            }

            // Uso de la entidad Deposit para reglas de negocio
            const depositEntity = new DepositEntity({ ...depositoDoc.toObject(), owner_id: depositoDoc.owner_id.toString() });

            if (!depositEntity.isSensorActive("TS300B")) {
                console.log(`El sensor TS300B en ${depositEntity.name} no está activo.`);
                return;
            }

            // Uso de la entidad para transformar valor crudo a físico
            const ntuValue = depositEntity.transformRawValue("TS300B", promedioADC);

            const sensor = depositoDoc.sensors?.find((s: any) => s.type === "TS300B");
            const now = new Date();

            // Uso de la entidad Reading para validaciones
            const readingEntity = new ReadingEntity({
                date: now,
                value: ntuValue,
                metadata: {
                    sensor_id: sensor?._id?.toString(),
                    deposits_id: depositoDoc._id.toString(),
                    sensor_type: sensor?.type
                }
            } as any);

            readingEntity.validate(); // lanza error si el valor/rango es inválido

            const dateBucket = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());

            console.log(`El depósito ${depositEntity.name} ADC turbidez recibido: ${promedioADC} de ${deviceIp}, con una turbidez de: ${ntuValue} NTU y guardado en el bucket ${dateBucket.toISOString()}`);

            // Se guarda la lectura usando el bucket pattern
            await ReadingsBucketModel.findOneAndUpdate(
                { sensor_id: sensor?._id, deposit_id: depositoDoc._id, date_bucket: dateBucket },
                {
                    $push: { readings: { timestamp: now, value: ntuValue } },
                    $inc: { count: 1, sum: ntuValue }
                },
                { upsert: true }
            );

            // Se emite a Flutter a través del WebSocket
            if (io) {
                io.emit("deposit_turbidity_update", {
                    ip: deviceIp,
                    ntu: ntuValue
                });
            }

        } catch (error: any) {
            console.error("Error en Sensor de turbidez:", error.message);
        }
    });
};

export default turbiditySensor;
