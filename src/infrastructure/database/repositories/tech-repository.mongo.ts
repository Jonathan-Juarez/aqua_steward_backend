import { ITechRepository } from "../../../domain/repository/tech-repository.interface";
import { ISystemStatsDTO, ITechUserSummaryDTO } from "../../../app/dtos/tech.dto";
import UserModel from "../models/user-model";
import DepositsModel from "../models/deposit-model";

export default class TechRepositoryMongo implements ITechRepository {
    async getSystemStats(): Promise<ISystemStatsDTO> {
        const totalUsers = await UserModel.countDocuments();
        const totalDeposits = await DepositsModel.countDocuments();
        const deposits = await DepositsModel.find().lean();

        let distance = 0, ph = 0, turbidity = 0;
        for (const deposit of deposits) {
            for (const sensor of deposit.sensors || []) {
                if (sensor.state) {
                    if (sensor.type === "HC-SR04") distance++;
                    if (sensor.type === "PH-4502C") ph++;
                    if (sensor.type === "TS300B") turbidity++;
                }
            }
        }
        // Se retorna el total de usuarios, depósitos y sensores activos
        return { totalUsers, totalDeposits, activeSensors: { distance, ph, turbidity } };
    }

    async getAllUsers(): Promise<ITechUserSummaryDTO[]> {
        const users = await UserModel.find().sort({ createdAt: -1 }).lean();
        const deposits = await DepositsModel.find().lean();

        return users.map((user) => ({
            id: user._id.toString(),
            name: user.name,
            last_name: user.last_name,
            email: user.email,
            global_role: user.global_role || "user",
            assignedDepositsCount: deposits.filter((deposit) =>
                deposit.owner_id.toString() === user._id.toString() ||
                user.assigned_deposits?.some((assignment: any) => assignment.deposit_id.toString() === deposit._id.toString() && assignment.status === "accepted")
            ).length,
            createdAt: user.createdAt,
            // Se ordenan los usuarios por rol global. Los técnicos primero y luego los usuarios.
        })).sort((a, b) => (a.global_role === "technician" ? -1 : 1));
    }
}
