import { mqttEvents } from "./broker";
import DepositsModel from "../database/models/deposit-model";
import ReadingsBucketModel from "../database/models/reading-model";
import DepositEntity from "../../domain/entities/deposit";
import ReadingEntity from "../../domain/entities/reading";

const phSensor = (io: any) => {
    console.log("Sensor pH-4502C activado.");

    mqttEvents.on("message_received", async ({ topic, message }: { topic: string, message: Buffer }) => {
        if (!topic.includes("/ph")) return;

        try {
            const parts = topic.split("/");
            const deviceIp = parts[1];
            const promedioADC = parseFloat(message.toString());

            if (isNaN(promedioADC)) return;

            // Se busca el depósito por IP
            const depositoDoc = await DepositsModel.findOne({ ip: deviceIp });
            if (!depositoDoc) {
                console.log(`pH: Recibido dato de IP desconocida: ${deviceIp}`);
                return;
            }

            // Uso de la entidad Deposit para reglas de negocio
            const depositEntity = new DepositEntity({ ...depositoDoc.toObject(), owner_id: depositoDoc.owner_id.toString() });

            if (!depositEntity.isSensorActive("PH-4502C")) {
                console.log(`El sensor pH en el depósito ${depositEntity.name} no está activo.`);
                return;
            }

            // Uso de la entidad para transformar valor crudo a físico
            const phValue = depositEntity.transformRawValue("PH-4502C", promedioADC);

            const sensor = depositoDoc.sensors?.find((s: any) => s.type === "PH-4502C");
            const now = new Date();

            // Uso de la entidad Reading para validaciones
            const readingEntity = new ReadingEntity({
                date: now,
                value: phValue,
                metadata: {
                    sensor_id: sensor?._id?.toString(),
                    deposits_id: depositoDoc._id.toString(),
                    sensor_type: sensor?.type
                }
            } as any);

            readingEntity.validate(); // lanza error si el valor/rango es inválido

            const dateBucket = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());

            console.log(`El depósito ${depositEntity.name} ADC pH recibido: ${promedioADC} de ${deviceIp}, con un pH de: ${phValue} y guardado en el bucket ${dateBucket.toISOString()}`);

            // Se guarda la lectura usando el bucket pattern
            await ReadingsBucketModel.findOneAndUpdate(
                { sensor_id: sensor?._id, deposit_id: depositoDoc._id, date_bucket: dateBucket },
                {
                    $push: { readings: { timestamp: now, value: phValue } },
                    $inc: { count: 1, sum: phValue }
                },
                { upsert: true }
            );

            // Se emite a Flutter a través del WebSocket
            if (io) {
                io.emit("deposit_ph_update", {
                    ip: deviceIp,
                    ph: phValue
                });
            }

        } catch (error: any) {
            console.error("Error en sensor de pH:", error.message);
        }
    });
};

export default phSensor;
