class Alert {
    constructor(data) {
        this.id = data.id;
        this.generation_date = data.generation_date || new Date();
        this.state = data.state || "activa"; // Cuando llega al usuario está activa, una vez leída, pasa a inactiva.
        this.description = data.description;
        this.sensor_id = data.sensor_id;
        this.deposit_id = data.deposit_id;

        // Estructura de reading_trigger (Snapshot de la lectura)
        this.reading_trigger = data.reading_trigger ? {
            value: data.reading_trigger.value,
            date: data.reading_trigger.date || new Date(),
        } : null;

        this.createdAt = data.createdAt;
    }

    // Reglas de negocio.
    validate() {
        if (!this.state) throw new Error("El estado de la alerta es requerido");
        if (!this.sensor_id) throw new Error("El id del sensor es requerido");
        if (!this.deposit_id) throw new Error("El id del depósito es requerido");
    }
}

module.exports = Alert;
