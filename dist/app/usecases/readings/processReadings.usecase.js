"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const number_utils_1 = require("../../../domain/utils/number-utils");
const threshold_utils_1 = require("../../../domain/utils/threshold-utils");
const reading_1 = __importDefault(require("../../../domain/entities/reading"));
const notification_model_1 = __importDefault(require("../../../infrastructure/database/models/notification-model"));
const user_model_1 = __importDefault(require("../../../infrastructure/database/models/user-model"));
const firebase_service_1 = require("../../../infrastructure/services/firebase.service");
const mongoose_1 = require("mongoose");
// Mapa que relaciona cada tópico MQTT con el tipo de sensor correspondiente. Record<string, string> es un mapa donde la clave y el valor son strings.
const TOPIC_TO_SENSOR = {
    "distancia": "HC-SR04",
    "ph": "PH-4502C",
    "turbidez": "TS300B"
};
// Mapa que asocia el sensor físico con su nombre legible.
const SENSOR_DISPLAY_NAMES = {
    "HC-SR04": "🚨 Alerta de Nivel",
    "PH-4502C": "🚨 Alerta de pH",
    "TS300B": "🚨 Alerta de Turbidez"
};
// Control de spam/cooldown en memoria: key = `depositId:sensorType` -> value = timestamp del último envío
const cooldowns = new Map();
const COOLDOWN_TIME = 5 * 60 * 1000; // 5 minutos de pausa para evitar el spam de notificaciones.
// Caso de uso genérico que procesa la lectura de cualquier sensor.
class ProcessReadingsUseCase {
    depositRepository;
    readingRepository;
    realTimeGateway;
    constructor(depositRepository, readingRepository, realTimeGateway) {
        this.depositRepository = depositRepository;
        this.readingRepository = readingRepository;
        this.realTimeGateway = realTimeGateway;
    }
    async execute(dto) {
        const sensorType = TOPIC_TO_SENSOR[dto.topicKey];
        if (!sensorType)
            throw new Error(`Tópico desconocido: ${dto.topicKey}`);
        // Se busca el depósito asociado a la IP del dispositivo.
        const deposit = await this.depositRepository.findByIp(dto.deviceIp);
        if (!deposit)
            throw new Error(`IP desconocida: ${dto.deviceIp}`);
        // Se verifica que el sensor esté activo en el depósito.
        if (!deposit.isSensorActive(sensorType)) {
            throw new Error(`Sensor ${sensorType} en ${deposit.name} no está activo.`);
        }
        // Se transforma el valor crudo al valor físico usando la entidad de dominio y se redondea a 1 decimal máximo.
        const processedValue = (0, number_utils_1.roundTo1Decimal)(deposit.transformRawValue(sensorType, dto.rawValue));
        // Se obtiene el ID del sensor desde la entidad para la metadata de la lectura.
        const sensor = deposit.sensors.find(sensor => sensor.type === sensorType);
        const reading = new reading_1.default({
            date: new Date(),
            value: processedValue,
            metadata: {
                sensor_id: sensor?._id?.toString() ?? sensor?.id,
                deposits_id: deposit.id,
                sensor_type: sensorType
            }
        });
        reading.validate();
        // Se persiste la lectura en el bucket correspondiente.
        await this.readingRepository.saveBucket(reading);
        // Se emite el evento al cliente WebSocket a través de nuestro gateway (puerto de salida)
        this.realTimeGateway.emitDepositUpdate(deposit.id, dto.deviceIp, dto.topicKey, processedValue);
        // Lógica de Detección de Umbrales y Alerta
        if (sensor) {
            const evaluation = (0, threshold_utils_1.evaluateThreshold)(processedValue, sensor.min_value, sensor.max_value, deposit.name, sensor.unit || "");
            if (evaluation.isTriggered) {
                await this.triggerAlert(deposit, sensorType, sensor, evaluation.triggerValue, evaluation.message);
            }
        }
        return {
            sensorType,
            deviceIp: dto.deviceIp,
            processedValue
        };
    }
    async triggerAlert(deposit, sensorType, sensor, value, alertMsg) {
        const cooldownKey = `${deposit.id}:${sensorType}`;
        const now = Date.now();
        const lastSent = cooldowns.get(cooldownKey) || 0;
        if (now - lastSent < COOLDOWN_TIME) {
            // Evitar spam de alertas durante el periodo de enfriamiento
            return;
        }
        // Registrar cooldown de inmediato
        cooldowns.set(cooldownKey, now);
        try {
            // Guardar la alerta/notificación en la Base de Datos
            const typeCategory = sensorType === "PH-4502C" ? "pH" : (sensorType === "TS300B" ? "Turbidez" : "Nivel");
            const notification = new notification_model_1.default({
                generation_date: new Date(),
                state: "activa",
                title: SENSOR_DISPLAY_NAMES[sensorType],
                type: typeCategory,
                description: alertMsg,
                sensor_id: sensor._id || sensor.id,
                deposit_id: deposit.id,
                reading_trigger: {
                    value: value,
                    date: new Date()
                }
            });
            await notification.save();
            // Buscar usuarios asociados al depósito para mandar push.
            // Se usa $elemMatch para garantizar que deposit_id y status coincidan en el MISMO elemento del array.
            const depositObjectId = new mongoose_1.Types.ObjectId(deposit.id);
            const users = await user_model_1.default.find({
                $or: [
                    { _id: deposit.owner_id },
                    { assigned_deposits: { $elemMatch: { deposit_id: depositObjectId, status: "accepted" } } }
                ]
            });
            // Recopilar todos los tokens FCM
            const tokens = [];
            for (const user of users) {
                if (user.fcmTokens && user.fcmTokens.length > 0) {
                    tokens.push(...user.fcmTokens);
                }
            }
            // Enviar notificación push multicast
            if (tokens.length > 0) {
                const title = `${SENSOR_DISPLAY_NAMES[sensorType]}`;
                await (0, firebase_service_1.sendPushNotification)(tokens, title, alertMsg, {
                    depositId: deposit.id,
                    sensorType: sensorType
                });
            }
        }
        catch (error) {
            console.error("Error al despachar alerta de umbral:", error.message);
        }
    }
}
exports.default = ProcessReadingsUseCase;
