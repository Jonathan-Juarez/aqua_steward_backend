import IRealTimeRepository from "../../domain/repository/realtime-repository.interface";
import { SensorConfig } from "../config/sensor.config";
import { Server } from "socket.io";

export default class WebSocketGateway implements IRealTimeRepository {
    private readonly noClientsWarningAt = new Map<string, number>();

    constructor(private io: Server) { }

    emitDepositUpdate(
        depositId: string,
        deviceIp: string,
        topicKey: string,
        processedValue: number
    ): void {
        // Se mapea el topicKey a un evento y clave de mensaje con ayuda del archivo sensor.config.
        const config = SensorConfig[topicKey];
        if (!config) return;

        const connectedClients = this.io.engine.clientsCount;
        if (connectedClients === 0) {
            const now = Date.now();
            const lastWarning = this.noClientsWarningAt.get(config.wsEvent) ?? 0;

            // Evita llenar los logs cuando los sensores publican continuamente.
            if (now - lastWarning >= 60_000) {
                console.warn(
                    `[Socket.IO] ${config.wsEvent} generado sin clientes conectados.`
                );
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
