import { mqttEvents, getMqttClient } from "./broker";
import ProcessReadingsUseCase from "../../app/usecases/readings/processReadings.usecase";
import DepositRepositoryMongo from "../database/repositories/deposit-repository.mongo";
import ReadingRepositoryMongo from "../database/repositories/reading-repository.mongo";

import WebSocket from "./websocket";
import { SensorConfig } from "../config/sensor.config";

// Se instancian los repositorios y se inyectan al caso de uso.
const depositRepository = new DepositRepositoryMongo();
const readingRepository = new ReadingRepositoryMongo();

// Procesa los mensajes MQTT de todos los sensores.
const sensorListener = (io: any) => {
    const realTimeRepository = new WebSocket(io);
    const processSensorReading = new ProcessReadingsUseCase(depositRepository, readingRepository, realTimeRepository);

    console.log("Listener de sensores activado.");

    mqttEvents.on("message_received", async ({ topic, message }: { topic: string, message: Buffer }) => {
        try {
            // Se divide el tópico para obtener la IP del dispositivo y la clave del sensor (aquasteward/ip/sensor_type).
            const parts = topic.split("/");
            if (parts.length < 3) return;

            const deviceIp = parts[1];
            const topicKey = parts[2];

            // Se ignoran tópicos que no corresponden a sensores configurados.
            const config = SensorConfig[topicKey];
            if (!config) return;

            const rawValue = parseFloat(message.toString());
            if (isNaN(rawValue)) return;

            // Se delega la lógica de negocio al caso de uso.
            const result = await processSensorReading.execute({ deviceIp, topicKey, rawValue });

            console.log(`Sensor ${result.sensorType}: ${rawValue} -> ${result.processedValue} de ${deviceIp}`);

        } catch (error: any) {
            // Se omiten errores esperados como IP desconocida o sensor inactivo.
            if (error.message.includes("desconocida") || error.message.includes("no está activo")) {
                console.log(error.message);
                return;
            }
            console.error("Error al escuchar el sensor:", error.message);
        }
    });
};

export default sensorListener;
