"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SensorConfig = void 0;
exports.SensorConfig = {
    "distancia": { wsEvent: "deposit_level_update", wsKey: "litros" },
    "ph": { wsEvent: "deposit_ph_update", wsKey: "ph" },
    "turbidez": { wsEvent: "deposit_turbidity_update", wsKey: "ntu" }
};
