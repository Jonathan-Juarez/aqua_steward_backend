"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app_1 = require("./app");
const connect_db_1 = __importDefault(require("./infrastructure/config/connect-db"));
const broker_1 = require("./infrastructure/network/broker");
const sensor_listener_1 = __importDefault(require("./infrastructure/network/sensor_listener"));
const configuredPort = Number(process.env.PORT);
const port = Number.isInteger(configuredPort) && configuredPort > 0
    ? configuredPort
    : 3000;
// Iniciar Servidor
app_1.server.listen(port, "0.0.0.0", async () => {
    await (0, connect_db_1.default)();
    console.log(`Servidor corriendo en puerto ${port}`);
    // Conexión a HiveMQ
    (0, broker_1.initMQTT)();
    // Se escuchan los mensajes MQTT de los sensores.
    (0, sensor_listener_1.default)(app_1.io);
});
