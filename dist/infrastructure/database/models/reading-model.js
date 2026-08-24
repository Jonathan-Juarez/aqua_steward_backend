"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const number_utils_1 = require("../../../domain/utils/number-utils");
const ReadingsBucketSchema = new mongoose_1.Schema({
    sensor_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true
    },
    deposit_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true
    },
    // Fecha del bucket (2026-03-17 12:00:00)
    date_bucket: {
        type: Date,
        required: true
    },
    // Cantidad de lecturas en este bucket
    count: {
        type: Number,
        default: 0
    },
    // Útil para promedios rápidos (sin necesidad de procesar todo el bucket).
    sum: {
        type: Number,
        default: 0,
        get: (num) => (0, number_utils_1.roundTo1Decimal)(num)
    },
    readings: [
        {
            timestamp: { type: Date, required: true },
            value: {
                type: Number,
                required: true,
                get: (num) => (0, number_utils_1.roundTo1Decimal)(num)
            }
        }
    ]
}, {
    versionKey: false,
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
});
// Indice compuesto que organiza los sensors_id de forma ascendente para encontrar los datos de un sensor en específico y los date_bucket de forma descendente para encontrar los datos más recientes.
ReadingsBucketSchema.index({ sensor_id: 1, date_bucket: -1 });
const ReadingsBucketModel = (0, mongoose_1.model)("ReadingsBucket", ReadingsBucketSchema);
exports.default = ReadingsBucketModel;
