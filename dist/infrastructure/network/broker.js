"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectMQTT = exports.getMqttClient = exports.mqttEvents = exports.initMQTT = void 0;
const mqtt = __importStar(require("mqtt"));
const events_1 = require("events");
// Se crea un EventEmitter para manejar los eventos MQTT.
class MqttEmitter extends events_1.EventEmitter {
}
const mqttEvents = new MqttEmitter();
exports.mqttEvents = mqttEvents;
// Se declara client aquí arriba para poder exportarlo.
let client;
const initMQTT = () => {
    const mqttClient = mqtt.connect(process.env.MQTT_CLUSTER_URL, {
        port: Number(process.env.MQTT_PORT),
        username: process.env.MQTT_USERNAME,
        password: process.env.MQTT_PASSWORD,
        // Se genera un ID único para cada cliente. El toString(16) se usa para convertir el número a hexadecimal. El substr(2, 8) empezando a contar desde el segundo carácter y tomando 8 caracteres. 
        clientId: "Aqua_Server_" + Math.random().toString(16).substr(2, 8)
    });
    client = mqttClient;
    mqttClient.on("connect", () => {
        console.log("Broker MQTT Conectado");
        mqttClient.subscribe("aquasteward/#", (error) => {
            if (!error)
                console.log("Escuchando tráfico en: aquasteward/#");
        });
    });
    mqttClient.on("message", (topic, message) => {
        mqttEvents.emit("message_received", { topic, message });
    });
    mqttClient.on("error", (error) => {
        console.error("Error MQTT:", error.message);
    });
};
exports.initMQTT = initMQTT;
// Retorna el cliente MQTT una vez que fue inicializado.
const getMqttClient = () => {
    if (!client) {
        throw new Error("El cliente MQTT todavía no está inicializado.");
    }
    return client;
};
exports.getMqttClient = getMqttClient;
// Cierra limpiamente la conexión cuando CapRover reemplaza el contenedor.
const disconnectMQTT = async () => {
    if (!client)
        return;
    await client.endAsync();
    client = undefined;
    console.log("Broker MQTT desconectado correctamente.");
};
exports.disconnectMQTT = disconnectMQTT;
