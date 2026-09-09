"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Notification {
    id;
    generation_date;
    state;
    description;
    sensor_id;
    deposit_id;
    reading_trigger;
    createdAt;
    constructor(data) {
        this.id = data.id;
        this.generation_date = data.generation_date || new Date();
        this.state = data.state || "activa"; // 'activa' o 'inactiva' (leída)
        this.description = data.description;
        this.sensor_id = data.sensor_id;
        this.deposit_id = data.deposit_id;
        this.reading_trigger = data.reading_trigger ? {
            value: data.reading_trigger.value,
            date: data.reading_trigger.date || new Date(),
        } : undefined;
        this.createdAt = data.createdAt;
    }
    validate() {
        if (!this.state)
            throw new Error("El estado de la notificación es requerido");
        if (!this.sensor_id)
            throw new Error("El id del sensor es requerido");
        if (!this.deposit_id)
            throw new Error("El id del depósito es requerido");
    }
}
exports.default = Notification;
