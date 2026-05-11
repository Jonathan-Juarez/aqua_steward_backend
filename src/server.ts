import dotenv from "dotenv";
dotenv.config();

import { server, io } from "./app";
import connectDB from "./infrastructure/config/connect-db";
import { initMQTT } from "./infrastructure/network/broker";
import sensorListener from "./infrastructure/network/sensor_listener";


// Iniciar Servidor
server.listen(Number(process.env.PORT), "0.0.0.0", async () => {
    await connectDB();
    console.log(`Servidor corriendo en puerto ${process.env.PORT}`);
    // Conexión a HiveMQ
    initMQTT();
    // Se escuchan los mensajes MQTT de los sensores.
    sensorListener(io);
});
