"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// Se define un esquema de acuerdo con IDepositsDoc.
const DepositsSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.ObjectId,
        required: true
    },
    sensors: [{
            type: {
                type: String,
                required: true
            },
            state: {
                type: Boolean,
                required: true
            },
            unit: {
                type: String,
                required: true
            },
            min_value: {
                type: Number,
            },
            max_value: {
                type: Number,
                required: true
            }
        }],
}, {
    versionKey: false,
    timestamps: true
});
const DepositsModel = (0, mongoose_1.model)("Deposits", DepositsSchema);
exports.default = DepositsModel;
