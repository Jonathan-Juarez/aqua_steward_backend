"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const broker_1 = require("./broker");
const processReadings_usecase_1 = __importDefault(require("../../app/usecases/readings/processReadings.usecase"));
const deposit_repository_mongo_1 = __importDefault(require("../database/repositories/deposit-repository.mongo"));
const reading_repository_mongo_1 = __importDefault(require("../database/repositories/reading-repository.mongo"));
const websocket_1 = __importDefault(require("./websocket"));
const sensor_config_1 = require("../config/sensor.config");
// Se instancian los repositorios y se inyectan al caso de uso.
const depositRepository = new deposit_repository_mongo_1.default();
const readingRepository = new reading_repository_mongo_1.default();
// Procesa los mensajes MQTT de todos los sensores.
const sensorListener = (io) => {
    const realTimeRepository = new websocket_1.default(io);
    const processSensorReading = new processReadings_usecase_1.default(depositRepository, readingRepository, realTimeRepository);
    console.log("Listener de sensores activado.");
    broker_1.mqttEvents.on("message_received", async ({ topic, message }) => {
        try {
            // Se divide el tópico para obtener la IP del dispositivo y la clave del sensor (aquasteward/ip/sensor_type).
            const parts = topic.split("/");
            if (parts.length < 3)
                return;
            const deviceIp = parts[1];
            const topicKey = parts[2];
            // Se ignoran tópicos que no corresponden a sensores configurados.
            const config = sensor_config_1.SensorConfig[topicKey];
            if (!config)
                return;
            const rawValue = parseFloat(message.toString());
            if (isNaN(rawValue))
                return;
            // Se delega la lógica de negocio al caso de uso.
            const result = await processSensorReading.execute({ deviceIp, topicKey, rawValue });
            console.log(`Sensor ${result.sensorType}: ${rawValue} -> ${result.processedValue} de ${deviceIp}`);
        }
        catch (error) {
            // Se omiten errores esperados como IP desconocida o sensor inactivo.
            if (error.message.includes("desconocida") || error.message.includes("no está activo")) {
                console.log(error.message);
                return;
            }
            console.error("Error al escuchar el sensor:", error.message);
        }
    });
};
exports.default = sensorListener;
