import { Schema, model, Document } from "mongoose";

// Interfaz que tipa los documentos de la colección Deposits. Se extiende de Document para tener acceso a los métodos de Mongoose.
export interface IDepositsDoc extends Document {
    name: string;
    ip: string;
    capacity: number;
    installation_height: number;
    fill_gap: number;
    owner_id: Schema.Types.ObjectId;
    sensors?: any[];
    createdAt?: Date;
    updatedAt?: Date;
}

// Se define un esquema de acuerdo con IDepositsDoc.
const DepositsSchema = new Schema<IDepositsDoc>({
    name: {
        type: String,
        required: true
    },
    ip: {
        type: String,
        required: true,
        unique: true
    },
    capacity: {
        type: Number,
        required: true
    },
    installation_height: {
        type: Number,
        required: true
    },
    fill_gap: {
        type: Number,
        required: true
    },
    owner_id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    sensors: [{
        type: {
            type: String,
        },
        state: {
            type: Boolean,
            default: false
        },
        unit: {
            type: String
        },
        min_value: {
            type: Number
        },
        max_value: {
            type: Number
        }
    }],
}, {
    versionKey: false,
    timestamps: true
});

const DepositsModel = model<IDepositsDoc>("Deposits", DepositsSchema);
export default DepositsModel;
