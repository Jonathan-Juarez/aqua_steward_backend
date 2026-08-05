import express from "express";
import http from "http";
import { Server } from "socket.io";

// Importación de rutas.
import authRoute from "./infrastructure/routes/auth-route";
import depositsRoute from "./infrastructure/routes/deposit-route";
import readingRoute from "./infrastructure/routes/reading-route";
import teamRoute from "./infrastructure/routes/team-route";
import notificationRoute from "./infrastructure/routes/notification-route";
import { errors } from "./infrastructure/middlewares/errors";
import { createLimiter } from "./domain/utils/rate_limit";

// Crear instancia de express, servidor HTTP y servidor de Socket.IO.
export const app = express();
export const server = http.createServer(app);
// cors permite la comunicación entre backend y frontend. * permite la conexión desde cualquier origen (por el momento). 
export const io = new Server(server, { cors: { origin: "*" } });

// Desactivar cabecera X-Powered-By para evitar exploits al indicar el framework usado en las respuestas.
app.disable("x-powered-by");

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Limitadores según la sensibilidad del módulo.
const generalLimiter = createLimiter(1 * 60 * 1000, 60);  // 60 peticiones / 1 min para uso fluido de la app.
const authLimiter = createLimiter(15 * 60 * 1000, 10);    // 10 peticiones / 15 min para protección de login / claves.

// Rutas con su respectivo Rate Limiter
app.use("/api/auth", authLimiter, authRoute);
app.use("/api/deposit", generalLimiter, depositsRoute);
app.use("/api/reading", generalLimiter, readingRoute);
app.use("/api/team", generalLimiter, teamRoute);
app.use("/api/notifications", generalLimiter, notificationRoute);

// Middleware para manejo de errores globales.
app.use(errors);