"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sensor_config_1 = require("../config/sensor.config");
class WebSocketGateway {
    io;
    constructor(io) {
        this.io = io;
    }
    emitDepositUpdate(deviceIp, topicKey, processedValue) {
        // Se omite el envío del evento si no hay conexión con el cliente.
        if (!this.io)
            return;
        // Se mapea el topicKey a un evento y clave de mensaje con ayuda del archivo sensor.config.
        const config = sensor_config_1.SensorConfig[topicKey];
        if (!config)
            return;
        // Se emite el evento al cliente.
        this.io.emit(config.wsEvent, {
            ip: deviceIp,
            [config.wsKey]: processedValue
        });
    }
}
exports.default = WebSocketGateway;
