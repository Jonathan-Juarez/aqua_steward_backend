export const SensorConfig: Record<string, { wsEvent: string; wsKey: string }> = {
    "distancia": { wsEvent: "deposit_level_update", wsKey: "litros" },
    "ph": { wsEvent: "deposit_ph_update", wsKey: "ph" },
    "turbidez": { wsEvent: "deposit_turbidity_update", wsKey: "ntu" }
};
