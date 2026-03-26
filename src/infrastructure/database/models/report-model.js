const { model, Schema } = require("mongoose");
const ReportsSchema = new Schema({
    title: {
        type: String
    },
    creation_date: {
        type: Date
    },
    date_range: {
        start_date: {
            type: Date
        },
        end_date: {
            type: Date
        }
    },
    graphics: [{
        type: {
            type: String
        },
        statistics: {
            min_value: {
                type: Number
            },
            max_value: {
                type: Number
            },
            average: {
                type: Number
            },
            compliance_percentage: {
                type: Number
            },
            total_alerts_triggered: {
                type: Number
            },
            stability: {
                type: Number
            },
            critical_events: [{
                date: {
                    type: Date
                },
                value: {
                    type: Number
                },
                type: {
                    type: String,
                    above_max,
                    below_min,
                    sensor_error
                }
            }]
        },
        sensor_id: {
            type: Schema.Types.ObjectId,
            required: true
        }
    }],
    created_by: {
        type: Schema.Types.ObjectId,
        required: true
    }
}, {
    versionKey: false, // Deshabilita la versión (_v)
    timestamps: true // Agrega createdAt y updatedAt.
});

const ReportsModel = model("Reports", ReportsSchema);

module.exports = ReportsModel;