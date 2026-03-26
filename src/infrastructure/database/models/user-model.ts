import { Schema, model, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUserDoc extends Document {
    name: string;
    last_name: string;
    email: string;
    password?: string;
    assigned_deposits?: any[];
    createdAt?: Date;
    updatedAt?: Date;
}

const UserSchema = new Schema<IUserDoc>({
    name: {
        type: String,
        required: true,
        trim: true
    },
    last_name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    assigned_deposits: [{
        role: {
            type: String,
            default: "analista"
        },
        deposit_id: {
            type: Schema.Types.ObjectId,
            default: null
        }
    }],
}, {
    versionKey: false,
    timestamps: true
});

UserSchema.pre("save", async function () {
    const user = this as any;
    if (user.isModified("password") && user.password) {
        user.password = await bcrypt.hash(user.password, 10);
    }
});

const UserModel = model<IUserDoc>("User", UserSchema);
export default UserModel;
