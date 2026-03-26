import * as mqtt from "mqtt";
import { EventEmitter } from "events";

// Se crea un EventEmitter para manejar los eventos MQTT.
class MqttEmitter extends EventEmitter { }
const mqttEvents = new MqttEmitter();

// Se declara client aquí arriba para poder exportarlo.
let client: mqtt.MqttClient;

const initMQTT = () => {
    client = mqtt.connect(process.env.MQTT_CLUSTER_URL!, {
        port: Number(process.env.MQTT_PORT),
        username: process.env.MQTT_USERNAME,
        password: process.env.MQTT_PASSWORD,
        // Se genera un ID único para cada cliente. El toString(16) se usa para convertir el número a hexadecimal. El substr(2, 8) empezando a contar desde el segundo carácter y tomando 8 caracteres. 
        clientId: "Aqua_Server_" + Math.random().toString(16).substr(2, 8)
    });

    client.on("connect", () => {
        console.log("Broker MQTT Conectado");
        client.subscribe("aquasteward/#", (error) => {
            if (!error) console.log("Escuchando tráfico en: aquasteward/#");
        });
    });

    client.on("message", (topic, message) => {
        mqttEvents.emit("message_received", { topic, message });
    });

    client.on("error", (error) => {
        console.error("Error MQTT:", error.message);
    });
};

// Se modifica el export para que retorne también una función que nos devuelva el client actual
const getMqttClient = (): mqtt.MqttClient => client;

export { initMQTT, mqttEvents, getMqttClient };
