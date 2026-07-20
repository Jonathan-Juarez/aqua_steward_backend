import { Schema, model, Document } from "mongoose";

export interface INotificationDoc extends Document {
    generation_date: Date;
    state: string;
    title?: string;
    type?: string;
    description: string;
    sensor_id?: any;
    deposit_id?: any;
    user_id?: any;
    reading_trigger?: {
        value: number;
        date: Date;
    };
    createdAt?: Date;
    updatedAt?: Date;
}

const NotificationSchema = new Schema<INotificationDoc>({
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
        type: Schema.Types.ObjectId
    },
    deposit_id: {
        type: Schema.Types.ObjectId
    },
    user_id: {
        type: Schema.Types.ObjectId
    },
    reading_trigger: {
        value: {
            type: Number
        },
        date: {
            type: Date,
            default: Date.now
        }
    }
}, {
    versionKey: false,
    timestamps: true
});

const NotificationModel = model<INotificationDoc>("Notifications", NotificationSchema);
export default NotificationModel;
