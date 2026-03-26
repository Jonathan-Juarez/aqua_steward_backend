import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";
import { Server } from "socket.io";

import connectDB from "./infrastructure/config/connect-db";
import authRoute from "./infrastructure/routes/auth-route";
import depositsRoute from "./infrastructure/routes/deposit-route";

// Se importan los módulos de MQTT.
import { initMQTT } from "./infrastructure/mqtt/broker";
import startLevelSensor from "./infrastructure/mqtt/level-sensor";
import startPhSensor from "./infrastructure/mqtt/ph-sensor";
import startTurbiditySensor from "./infrastructure/mqtt/turbidity-sensor";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    // cors permite la comunicación entre backend y frontend. * permite la conexión desde cualquier origen (por el momento). 
    cors: { origin: "*" }
});

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use("/api/auth", authRoute);
app.use("/api/deposit", depositsRoute);

// Iniciar Servidor
const PORT = process.env.PORT;

server.listen(Number(PORT), "0.0.0.0", async () => {
    await connectDB();
    console.log(`Servidor activado en localhost:${PORT}`);

    // Conexión a HiveMQ
    initMQTT();

    // Se activan los sensores y se les pasa el io para emitir datos a Flutter.
    startLevelSensor(io);
    startPhSensor(io);
    startTurbiditySensor(io);
});
