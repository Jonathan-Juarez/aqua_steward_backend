"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sensor_config_1 = require("../config/sensor.config");
class WebSocketGateway {
    io;
    noClientsWarningAt = new Map();
    constructor(io) {
        this.io = io;
    }
    emitDepositUpdate(depositId, deviceIp, topicKey, processedValue) {
        // Se mapea el topicKey a un evento y clave de mensaje con ayuda del archivo sensor.config.
        const config = sensor_config_1.SensorConfig[topicKey];
        if (!config)
            return;
        const connectedClients = this.io.engine.clientsCount;
        if (connectedClients === 0) {
            const now = Date.now();
            const lastWarning = this.noClientsWarningAt.get(config.wsEvent) ?? 0;
            // Evita llenar los logs cuando los sensores publican continuamente.
            if (now - lastWarning >= 60_000) {
                console.warn(`[Socket.IO] ${config.wsEvent} generado sin clientes conectados.`);
                this.noClientsWarningAt.set(config.wsEvent, now);
            }
        }
        // Se emite el evento al cliente.
        this.io.emit(config.wsEvent, {
            depositId,
            ip: deviceIp,
            sensor: topicKey,
            value: processedValue,
            [config.wsKey]: processedValue,
            timestamp: new Date().toISOString()
        });
    }
}
exports.default = WebSocketGateway;
