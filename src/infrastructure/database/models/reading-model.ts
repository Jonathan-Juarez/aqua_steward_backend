import { Schema, model, Document, Types } from "mongoose";

export interface IReading {
    timestamp: Date;
    value: number;
}

export interface IReadingsBucketDoc extends Document {
    sensor_id: Types.ObjectId;
    deposit_id: Types.ObjectId;
    date_bucket: Date;
    count: number;
    sum: number;
    readings: IReading[];
}

const ReadingsBucketSchema = new Schema<IReadingsBucketDoc>({
    sensor_id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    deposit_id: {
        type: Schema.Types.ObjectId,
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
        default: 0
    },
    readings: [
        {
            timestamp: { type: Date, required: true },
            value: { type: Number, required: true }
        }
    ]
}, {
    versionKey: false,
    timestamps: true
});

// Indice compuesto para mejorar la eficiencia de las consultas.
ReadingsBucketSchema.index({ sensor_id: 1, date_bucket: -1 });

const ReadingsBucketModel = model<IReadingsBucketDoc>("ReadingsBucket", ReadingsBucketSchema);

export default ReadingsBucketModel;
