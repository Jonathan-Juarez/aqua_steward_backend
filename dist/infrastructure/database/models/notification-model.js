"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const NotificationSchema = new mongoose_1.Schema({
    generation_date: {
        type: Date,
        default: Date.now
    },
    state: {
        type: String,
        enum: ["activa", "inactiva"],
        default: "activa"
    },
    title: {
        type: String
    },
    type: {
        type: String
    },
    description: {
        type: String,
        required: true
    },
    sensor_id: {
        type: mongoose_1.Schema.Types.ObjectId
    },
    deposit_id: {
        type: mongoose_1.Schema.Types.ObjectId
    },
    user_id: {
        type: mongoose_1.Schema.Types.ObjectId
    },
    reading_trigger: {
        value: {
            type: Number
        },
        date: {
            type: Date,
            default: Date.now
        }
    },
    read_by: {
        type: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
        default: []
    },
    deleted_by: {
        type: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
        default: []
    }
}, {
    versionKey: false,
    timestamps: true
});
const NotificationModel = (0, mongoose_1.model)("Notifications", NotificationSchema);
exports.default = NotificationModel;
