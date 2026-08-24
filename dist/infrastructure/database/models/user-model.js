"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const UserSchema = new mongoose_1.Schema({
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
                enum: ['owner', 'analyst', 'admin', "technician"]
            },
            deposit_id: {
                type: mongoose_1.Schema.Types.ObjectId
            },
            status: {
                type: String,
                enum: ['pending', 'accepted', 'rejected'],
                default: 'pending'
            }
        }],
    fcmTokens: {
        type: [String],
        default: []
    },
    global_role: {
        type: String,
        enum: ['user', 'technician'],
        default: 'user'
    }
}, {
    versionKey: false,
    timestamps: true
});
UserSchema.pre("save", async function () {
    const user = this;
    if (user.isModified("password") && user.password) {
        user.password = await bcryptjs_1.default.hash(user.password, 10);
    }
});
const UserModel = (0, mongoose_1.model)("User", UserSchema);
exports.default = UserModel;
