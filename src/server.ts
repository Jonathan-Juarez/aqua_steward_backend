import dotenv from "dotenv";
dotenv.config({ quiet: true });

import { server, io } from "./app";
import connectDB from "./infrastructure/config/connect-db";
import mongoose from "mongoose";
import { disconnectMQTT, initMQTT } from "./infrastructure/network/broker";
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

let isShuttingDown = false;

const shutdown = async (signal: "SIGTERM" | "SIGINT"): Promise<void> => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    console.log(`${signal} recibido. Cerrando el servidor correctamente...`);

    const forceShutdown = setTimeout(() => {
        console.error("El cierre superó 10 segundos; finalizando el proceso.");
        process.exit(1);
    }, 10_000);
    forceShutdown.unref();

    try {
        io.disconnectSockets(true);

        await new Promise<void>((resolve, reject) => {
            server.close((error) => error ? reject(error) : resolve());
        });

        await Promise.all([
            disconnectMQTT(),
            mongoose.disconnect()
        ]);

        console.log("Servidor cerrado correctamente.");
        process.exit(0);
    } catch (error: any) {
        console.error("Error durante el cierre del servidor:", error.message);
        process.exit(1);
    }
};

process.once("SIGTERM", () => void shutdown("SIGTERM"));
process.once("SIGINT", () => void shutdown("SIGINT"));
