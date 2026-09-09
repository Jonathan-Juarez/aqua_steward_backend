"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = __importDefault(require("../models/user-model"));
const deposit_model_1 = __importDefault(require("../models/deposit-model"));
class TechRepositoryMongo {
    async getSystemStats() {
        const totalUsers = await user_model_1.default.countDocuments();
        const totalDeposits = await deposit_model_1.default.countDocuments();
        const deposits = await deposit_model_1.default.find().lean();
        let distance = 0, ph = 0, turbidity = 0;
        for (const deposit of deposits) {
            for (const sensor of deposit.sensors || []) {
                if (sensor.state) {
                    if (sensor.type === "HC-SR04")
                        distance++;
                    if (sensor.type === "PH-4502C")
                        ph++;
                    if (sensor.type === "TS300B")
                        turbidity++;
                }
            }
        }
        // Se retorna el total de usuarios, depósitos y sensores activos
        return { totalUsers, totalDeposits, activeSensors: { distance, ph, turbidity } };
    }
    async getAllUsers() {
        const users = await user_model_1.default.find().sort({ createdAt: -1 }).lean();
        const deposits = await deposit_model_1.default.find().lean();
        return users.map((user) => ({
            id: user._id.toString(),
            name: user.name,
            last_name: user.last_name,
            email: user.email,
            global_role: user.global_role || "user",
            assignedDepositsCount: deposits.filter((deposit) => deposit.owner_id.toString() === user._id.toString() ||
                user.assigned_deposits?.some((assignment) => assignment.deposit_id.toString() === deposit._id.toString() && assignment.status === "accepted")).length,
            createdAt: user.createdAt,
            // Se ordenan los usuarios por rol global. Los técnicos primero y luego los usuarios.
        })).sort((a, b) => (a.global_role === "technician" ? -1 : 1));
    }
}
exports.default = TechRepositoryMongo;
