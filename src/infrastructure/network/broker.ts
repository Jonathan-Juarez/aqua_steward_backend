import * as mqtt from "mqtt";
import { EventEmitter } from "events";

// Se crea un EventEmitter para manejar los eventos MQTT.
class MqttEmitter extends EventEmitter { }
const mqttEvents = new MqttEmitter();

// Se declara client aquí arriba para poder exportarlo.
let client: mqtt.MqttClient | undefined;

const initMQTT = () => {
    const mqttClient = mqtt.connect(process.env.MQTT_CLUSTER_URL!, {
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
            if (!error) console.log("Escuchando tráfico en: aquasteward/#");
        });
    });

    mqttClient.on("message", (topic, message) => {
        mqttEvents.emit("message_received", { topic, message });
    });

    mqttClient.on("error", (error) => {
        console.error("Error MQTT:", error.message);
    });
};

// Retorna el cliente MQTT una vez que fue inicializado.
const getMqttClient = (): mqtt.MqttClient => {
    if (!client) {
        throw new Error("El cliente MQTT todavía no está inicializado.");
    }

    return client;
};

// Cierra limpiamente la conexión cuando CapRover reemplaza el contenedor.
const disconnectMQTT = async (): Promise<void> => {
    if (!client) return;

    await client.endAsync();
    client = undefined;
    console.log("Broker MQTT desconectado correctamente.");
};

export { initMQTT, mqttEvents, getMqttClient, disconnectMQTT };
