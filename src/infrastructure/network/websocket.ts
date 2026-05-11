import IRealTimeRepository from "../../domain/repository/realtime-repository.interface";
import { SensorConfig } from "../config/sensor.config";

export default class WebSocketGateway implements IRealTimeRepository {
    constructor(private io: any) { }

    emitDepositUpdate(deviceIp: string, topicKey: string, processedValue: number): void {
        // Se omite el envío del evento si no hay conexión con el cliente.
        if (!this.io) return;

        // Se mapea el topicKey a un evento y clave de mensaje con ayuda del archivo sensor.config.
        const config = SensorConfig[topicKey];
        if (!config) return;

        // Se emite el evento al cliente.
        this.io.emit(config.wsEvent, {
            ip: deviceIp,
            [config.wsKey]: processedValue
        });
    }
}
