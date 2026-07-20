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



// Crear instancia de express, servidor HTTP y servidor de Socket.IO.
export const app = express();
export const server = http.createServer(app);
// cors permite la comunicación entre backend y frontend. * permite la conexión desde cualquier origen (por el momento). 
export const io = new Server(server, { cors: { origin: "*" } });


// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use("/api/auth", authRoute);
app.use("/api/deposit", depositsRoute);
app.use("/api/reading", readingRoute);
app.use("/api/team", teamRoute);
app.use("/api/notifications", notificationRoute);

// Middleware para manejo de errores globales.
app.use(errors);
