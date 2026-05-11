import { ITeamRepository } from "../../../domain/repository/team-repository.interface";
import TeamMember from "../../../domain/entities/team";
import UserModel, { IUserDoc } from "../models/user-model";
import DepositsModel from "../models/deposit-model";

export class TeamRepositoryMongo implements ITeamRepository {

    private _toDomain(user: IUserDoc, deposit_id: string): TeamMember {
        const assignment = user.assigned_deposits?.find(a => a.deposit_id?.toString() === deposit_id);
        return new TeamMember({
            user_id: user._id.toString(),
            email: user.email,
            name: user.name,
            last_name: user.last_name,
            role: assignment ? assignment.role : "",
            status: assignment ? assignment.status : "pending"
        });
    }

    async getTeam(deposit_id: string): Promise<TeamMember[]> {
        const users = await UserModel.find({ "assigned_deposits.deposit_id": deposit_id });
        return users.map(user => this._toDomain(user, deposit_id));
    }

    async invite(deposit_id: string, email: string, role: string): Promise<TeamMember | null> {
        const user = await UserModel.findOne({ email });
        if (!user) return null;

        if (!user.assigned_deposits) {
            user.assigned_deposits = [];
        }

        const alreadyAssigned = user.assigned_deposits.find(a => a.deposit_id?.toString() === deposit_id);
        if (alreadyAssigned) return this._toDomain(user, deposit_id);

        user.assigned_deposits.push({ deposit_id, role, status: 'pending' });
        await user.save();

        return this._toDomain(user, deposit_id);
    }

    async update(deposit_id: string, user_id: string, role: string): Promise<TeamMember | null> {
        const user = await UserModel.findById(user_id);
        if (!user) return null;

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

    async delete(deposit_id: string, user_id: string): Promise<void> {
        const user = await UserModel.findById(user_id);
        if (!user) return;

        if (!user.assigned_deposits) return;

        user.assigned_deposits = user.assigned_deposits.filter(a => a.deposit_id?.toString() !== deposit_id);
        await user.save();
    }

    async acceptInvitation(deposit_id: string, user_id: string): Promise<void> {
        const user = await UserModel.findById(user_id);
        if (!user) return;

        if (!user.assigned_deposits) return;

        const assignmentIndex = user.assigned_deposits.findIndex(assigned => assigned.deposit_id?.toString() === deposit_id);
        if (assignmentIndex === -1) {
            return;
        }

        user.assigned_deposits[assignmentIndex].status = 'accepted';
        await user.save();
    }

    async rejectInvitation(deposit_id: string, user_id: string): Promise<void> {
        // Rechazar es equivalente a eliminar al miembro
        await this.delete(deposit_id, user_id);
    }

    async getInvitations(user_id: string): Promise<any[]> {
        const user = await UserModel.findById(user_id);
        if (!user) return [];

        const pendingAssignments = user.assigned_deposits?.filter(a => a.status === 'pending') || [];
        if (pendingAssignments.length === 0) return [];

        const invitations = await Promise.all(pendingAssignments.map(async (a) => {
            const deposit = await DepositsModel.findById(a.deposit_id);
            return {
                deposit_id: a.deposit_id.toString(),
                deposit_name: deposit ? deposit.name : "Desconocido",
                role: a.role
            };
        }));

        return invitations;
    }
}
