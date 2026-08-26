import express from "express";
import http from "http";
import { Server } from "socket.io";

// Importación de rutas.
import authRoute from "./infrastructure/routes/auth-route";
import depositsRoute from "./infrastructure/routes/deposit-route";
import readingRoute from "./infrastructure/routes/reading-route";
import teamRoute from "./infrastructure/routes/team-route";
import notificationRoute from "./infrastructure/routes/notification-route";
import techRoute from "./infrastructure/routes/tech-route";
import { errors } from "./infrastructure/middlewares/errors";
import { createLimiter } from "./domain/utils/rate_limit";

// Crear instancia de express, servidor HTTP y servidor de Socket.IO.
export const app = express();
export const server = http.createServer(app);
// Socket.IO acepta polling y WebSocket. CapRover debe tener habilitada la
// opción "Websocket Support" para permitir la actualización a wss://.
export const io = new Server(server, {
    path: "/socket.io",
    transports: ["polling", "websocket"],
    allowEIO3: true,
    pingInterval: 25_000,
    pingTimeout: 20_000,
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    console.log(
        `[Socket.IO] Cliente conectado: ${socket.id} ` +
        `(transporte: ${socket.conn.transport.name}, total: ${io.engine.clientsCount})`
    );

    socket.conn.on("upgrade", (transport) => {
        console.log(`[Socket.IO] ${socket.id} actualizado a ${transport.name}.`);
    });

    socket.on("disconnect", (reason) => {
        console.log(
            `[Socket.IO] Cliente desconectado: ${socket.id} ` +
            `(motivo: ${reason}, total: ${io.engine.clientsCount})`
        );
    });

    socket.emit("realtime_ready", {
        status: "connected",
        socketId: socket.id
    });
});

io.engine.on("connection_error", (error) => {
    console.error(
        `[Socket.IO] Error de conexión (${error.code}): ${error.message}`
    );
});

// Desactivar cabecera X-Powered-By para evitar exploits al indicar el framework usado en las respuestas.
app.disable("x-powered-by");

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Respuesta básica al abrir directamente el dominio del backend.
app.get("/", (_req, res) => {
    res.status(200).json({
        service: "AquaSteward Backend",
        status: "ok"
    });
});

// Endpoint liviano para verificar desde CapRover que el contenedor está activo.
app.get("/health", (_req, res) => {
    res.status(200).json({
        status: "ok",
        realtime: {
            path: "/socket.io",
            connectedClients: io.engine.clientsCount
        }
    });
});


// Limitadores según la sensibilidad del módulo.
const generalLimiter = createLimiter(1 * 60 * 1000, 60);  // 60 peticiones / 1 min para uso fluido de la app.
const authLimiter = createLimiter(15 * 60 * 1000, 20);    // 20 peticiones / 15 min para protección de login / claves.

// Rutas con su respectivo Rate Limiter
app.use("/api/auth", authLimiter, authRoute);
app.use("/api/deposit", generalLimiter, depositsRoute);
app.use("/api/reading", generalLimiter, readingRoute);
app.use("/api/team", generalLimiter, teamRoute);
app.use("/api/notifications", generalLimiter, notificationRoute);
app.use("/api/tech", techRoute); // El ténico puede usar su endpoint sin límite.

// Middleware para manejo de errores globales.
app.use(errors);
