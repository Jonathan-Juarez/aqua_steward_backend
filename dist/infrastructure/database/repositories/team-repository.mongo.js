"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamRepositoryMongo = void 0;
const team_1 = __importDefault(require("../../../domain/entities/team"));
const user_model_1 = __importDefault(require("../models/user-model"));
const deposit_model_1 = __importDefault(require("../models/deposit-model"));
class TeamRepositoryMongo {
    _toDomain(user, deposit_id) {
        const assignment = user.assigned_deposits?.find(a => a.deposit_id?.toString() === deposit_id);
        return new team_1.default({
            user_id: user._id.toString(),
            email: user.email,
            name: user.name,
            last_name: user.last_name,
            role: assignment ? assignment.role : "",
            status: assignment ? assignment.status : "pending"
        });
    }
    async getTeam(deposit_id) {
        const users = await user_model_1.default.find({ "assigned_deposits.deposit_id": deposit_id });
        return users.map(user => this._toDomain(user, deposit_id));
    }
    async invite(deposit_id, email, role) {
        const user = await user_model_1.default.findOne({ email });
        if (!user)
            return null;
        if (!user.assigned_deposits) {
            user.assigned_deposits = [];
        }
        const alreadyAssigned = user.assigned_deposits.find(a => a.deposit_id?.toString() === deposit_id);
        if (alreadyAssigned)
            return this._toDomain(user, deposit_id);
        user.assigned_deposits.push({ deposit_id, role, status: 'pending' });
        await user.save();
        return this._toDomain(user, deposit_id);
    }
    async update(deposit_id, user_id, role) {
        const user = await user_model_1.default.findById(user_id);
        if (!user)
            return null;
        if (!user.assigned_deposits) {
            user.assigned_deposits = [];
        }
        const assignmentIndex = user.assigned_deposits.findIndex(a => a.deposit_id?.toString() === deposit_id);
        if (assignmentIndex === -1) {
            return null;
        }
        user.assigned_deposits[assignmentIndex].role = role;
        await user.save();
        return this._toDomain(user, deposit_id);
    }
    async delete(deposit_id, user_id) {
        const user = await user_model_1.default.findById(user_id);
        if (!user)
            return;
        if (!user.assigned_deposits)
            return;
        user.assigned_deposits = user.assigned_deposits.filter(a => a.deposit_id?.toString() !== deposit_id);
        await user.save();
    }
    async acceptInvitation(deposit_id, user_id) {
        const user = await user_model_1.default.findById(user_id);
        if (!user)
            return;
        if (!user.assigned_deposits)
            return;
        const assignmentIndex = user.assigned_deposits.findIndex(assigned => assigned.deposit_id?.toString() === deposit_id);
        if (assignmentIndex === -1) {
            return;
        }
        user.assigned_deposits[assignmentIndex].status = 'accepted';
        await user.save();
    }
    async rejectInvitation(deposit_id, user_id) {
        // Rechazar es equivalente a eliminar al miembro
        await this.delete(deposit_id, user_id);
    }
    async getInvitations(user_id) {
        const user = await user_model_1.default.findById(user_id);
        if (!user)
            return [];
        const pendingAssignments = user.assigned_deposits?.filter(a => a.status === 'pending') || [];
        if (pendingAssignments.length === 0)
            return [];
        const invitations = await Promise.all(pendingAssignments.map(async (a) => {
            const deposit = await deposit_model_1.default.findById(a.deposit_id);
            return {
                deposit_id: a.deposit_id.toString(),
                deposit_name: deposit ? deposit.name : "Desconocido",
                role: a.role
            };
        }));
        return invitations;
    }
}
exports.TeamRepositoryMongo = TeamRepositoryMongo;
