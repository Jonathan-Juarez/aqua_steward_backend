"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.server = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
// Importación de rutas.
const auth_route_1 = __importDefault(require("./infrastructure/routes/auth-route"));
const deposit_route_1 = __importDefault(require("./infrastructure/routes/deposit-route"));
const reading_route_1 = __importDefault(require("./infrastructure/routes/reading-route"));
const team_route_1 = __importDefault(require("./infrastructure/routes/team-route"));
const notification_route_1 = __importDefault(require("./infrastructure/routes/notification-route"));
const tech_route_1 = __importDefault(require("./infrastructure/routes/tech-route"));
const errors_1 = require("./infrastructure/middlewares/errors");
const rate_limit_1 = require("./domain/utils/rate_limit");
// Crear instancia de express, servidor HTTP y servidor de Socket.IO.
exports.app = (0, express_1.default)();
exports.server = http_1.default.createServer(exports.app);
// cors permite la comunicación entre backend y frontend. * permite la conexión desde cualquier origen (por el momento). 
exports.io = new socket_io_1.Server(exports.server, { cors: { origin: "*" } });
// Desactivar cabecera X-Powered-By para evitar exploits al indicar el framework usado en las respuestas.
exports.app.disable("x-powered-by");
// Middlewares
exports.app.use(express_1.default.json());
exports.app.use(express_1.default.urlencoded({ extended: true }));
// Limitadores según la sensibilidad del módulo.
const generalLimiter = (0, rate_limit_1.createLimiter)(1 * 60 * 1000, 60); // 60 peticiones / 1 min para uso fluido de la app.
const authLimiter = (0, rate_limit_1.createLimiter)(15 * 60 * 1000, 20); // 20 peticiones / 15 min para protección de login / claves.
// Rutas con su respectivo Rate Limiter
exports.app.use("/api/auth", authLimiter, auth_route_1.default);
exports.app.use("/api/deposit", generalLimiter, deposit_route_1.default);
exports.app.use("/api/reading", generalLimiter, reading_route_1.default);
exports.app.use("/api/team", generalLimiter, team_route_1.default);
exports.app.use("/api/notifications", generalLimiter, notification_route_1.default);
exports.app.use("/api/tech", tech_route_1.default); // El ténico puede usar su endpoint sin límite.
// Middleware para manejo de errores globales.
exports.app.use(errors_1.errors);
