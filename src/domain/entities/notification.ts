export interface NotificationData {
    id?: string;
    generation_date?: Date;
    state?: string;
    description: string;
    sensor_id: string;
    deposit_id: string;
    reading_trigger?: {
        value: number;
        date: Date;
    };
    createdAt?: Date;
}

export default class Notification {
    id?: string;
    generation_date: Date;
    state: string;
    description: string;
    sensor_id: string;
    deposit_id: string;
    reading_trigger?: {
        value: number;
        date: Date;
    };
    createdAt?: Date;

    constructor(data: NotificationData) {
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

    validate(): void {
        if (!this.state) throw new Error("El estado de la notificación es requerido");
        if (!this.sensor_id) throw new Error("El id del sensor es requerido");
        if (!this.deposit_id) throw new Error("El id del depósito es requerido");
    }
}
