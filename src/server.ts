import dotenv from "dotenv";
dotenv.config();

import { server, io } from "./app";
import connectDB from "./infrastructure/config/connect-db";
import { initMQTT } from "./infrastructure/network/broker";
import sensorListener from "./infrastructure/network/sensor_listener";

const configuredPort = Number(process.env.PORT);
const port = Number.isInteger(configuredPort) && configuredPort > 0
    ? configuredPort
    : 3000;

// Iniciar Servidor
server.listen(port, "0.0.0.0", async () => {
    await connectDB();
    console.log(`Servidor corriendo en puerto ${port}`);
    // Conexión a HiveMQ
    initMQTT();
    // Se escuchan los mensajes MQTT de los sensores.
    sensorListener(io);
});
