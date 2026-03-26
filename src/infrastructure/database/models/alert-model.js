const { model, Schema } = require("mongoose");
const AlertsSchema = new Schema({
    generation_date: {
        type: Date
    },
    state: {
        type: String
    },
    description: {
        type: String
    },
    reading_trigger: {
        value: {
            type: Number
        },
        date: {
            type: Date
        },
        sensor_id: {
            type: Schema.Types.ObjectId,
            required: true
        }
    }
}, {
    versionKey: false, // Deshabilita la versión (_v)
    timestamps: true // Agrega createdAt y updatedAt.
});

const Alerts = model("Alerts", AlertsSchema);

module.exports = Alerts;