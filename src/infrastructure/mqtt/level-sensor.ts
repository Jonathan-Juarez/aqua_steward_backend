import { mqttEvents, getMqttClient } from "./broker";
import DepositsModel from "../database/models/deposit-model";
import ReadingsBucketModel from "../database/models/reading-model";
import DepositEntity from "../../domain/entities/deposit";
import ReadingEntity from "../../domain/entities/reading";

const levelSensor = (io: any) => {
    console.log("Sensor HC-SR04 activado.");

    mqttEvents.on("message_received", async ({ topic, message }: { topic: string, message: Buffer }) => {
        if (!topic.includes("/distancia")) return;

        try {
            const parts = topic.split("/");
            const deviceIp = parts[1];
            const detectedDistance = parseFloat(message.toString());

            if (isNaN(detectedDistance)) return;

            // Se busca el depósito por IP en DB
            const depositoDoc = await DepositsModel.findOne({ ip: deviceIp });
            if (!depositoDoc) {
                console.log(`Nivel: Recibido dato de IP desconocida: ${deviceIp}`);
                return;
            }

            // Uso de la entidad Deposit para reglas de negocio
            const depositEntity = new DepositEntity({ ...depositoDoc.toObject(), owner_id: depositoDoc.owner_id.toString() });

            if (!depositEntity.isSensorActive("HC-SR04")) {
                console.log(`El sensor HC-SR04 en ${depositEntity.name} no está activo.`);
                return;
            }

            // Uso de la entidad para transformar valor crudo (distancia) a final (litros)
            const currentLitters = depositEntity.transformRawValue("HC-SR04", detectedDistance);
            const percentage = (currentLitters / (depositEntity.capacity ?? 1)) * 100;

            const sensor = depositoDoc.sensors?.find((s: any) => s.type === "HC-SR04");
            const now = new Date();

            // Uso de la entidad Reading para validaciones
            const readingEntity = new ReadingEntity({
                date: now,
                value: currentLitters,
                metadata: {
                    sensor_id: sensor?._id?.toString(),
                    deposits_id: depositoDoc._id.toString(),
                    sensor_type: sensor?.type
                }
            } as any);

            readingEntity.validate(); // Lanza error si el valor/rango es inválido

            console.log(`Dato recibido: ${detectedDistance}cm de ${deviceIp} → ${percentage.toFixed(1)}% / ${currentLitters}L`);

            const dateBucket = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());

            // Se guarda la lectura usando el bucket pattern
            await ReadingsBucketModel.findOneAndUpdate(
                { sensor_id: sensor?._id, deposit_id: depositoDoc._id, date_bucket: dateBucket },
                {
                    $push: { readings: { timestamp: now, value: currentLitters } },
                    $inc: { count: 1, sum: currentLitters }
                },
                { upsert: true }
            );

            // Se usa el cliente existente para publicar el resultado en el tópico "/nivel"
            const publisherClient = getMqttClient();
            if (publisherClient && publisherClient.connected) {
                const mqttPayload = currentLitters.toString();
                publisherClient.publish(`aquasteward/${deviceIp}/nivel`, mqttPayload, { qos: 0, retain: true });
            }

            // Se emite a Flutter a través del WebSocket
            if (io) {
                io.emit("deposit_level_update", {
                    ip: deviceIp,
                    litros: currentLitters
                });
            }

        } catch (error: any) {
            console.error("Error en sensor de nivel:", error.message);
        }
    });
};

export default levelSensor;
