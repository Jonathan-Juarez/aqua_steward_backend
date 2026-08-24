"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamController = void 0;
const get_team_usecase_1 = require("../../app/usecases/team/get-team.usecase");
const invite_member_usecase_1 = require("../../app/usecases/team/invite-member.usecase");
const update_member_usecase_1 = require("../../app/usecases/team/update-member.usecase");
const delete_member_usecase_1 = require("../../app/usecases/team/delete-member.usecase");
const accept_invitation_usecase_1 = require("../../app/usecases/team/accept-invitation.usecase");
const reject_invitation_usecase_1 = require("../../app/usecases/team/reject-invitation.usecase");
const get_invitation_usecase_1 = require("../../app/usecases/team/get-invitation.usecase");
const team_repository_mongo_1 = require("../database/repositories/team-repository.mongo");
const auth_repository_mongo_1 = __importDefault(require("../database/repositories/auth-repository.mongo"));
const deposit_repository_mongo_1 = __importDefault(require("../database/repositories/deposit-repository.mongo"));
const teamRepository = new team_repository_mongo_1.TeamRepositoryMongo();
const authRepository = new auth_repository_mongo_1.default();
const depositRepository = new deposit_repository_mongo_1.default();
const getTeamUseCase = new get_team_usecase_1.GetTeamUseCase(teamRepository);
const inviteMemberUseCase = new invite_member_usecase_1.InviteMemberUseCase(teamRepository, authRepository, depositRepository);
const updateMemberUseCase = new update_member_usecase_1.UpdateMemberUseCase(teamRepository, authRepository, depositRepository);
const deleteMemberUseCase = new delete_member_usecase_1.DeleteMemberUseCase(teamRepository, authRepository, depositRepository);
const acceptInvitationUseCase = new accept_invitation_usecase_1.AcceptInvitationUseCase(teamRepository, authRepository);
const rejectInvitationUseCase = new reject_invitation_usecase_1.RejectInvitationUseCase(teamRepository, authRepository);
const getInvitationUseCase = new get_invitation_usecase_1.GetInvitationUseCase(teamRepository, authRepository);
class TeamController {
    static async getTeam(req, res) {
        const { depositId } = req.params;
        const team = await getTeamUseCase.execute({ deposit_id: depositId.toString() });
        res.status(200).json(team);
    }
    static async inviteMember(req, res) {
        const { depositId } = req.params;
        const { email, role } = req.body;
        const invitedMember = await inviteMemberUseCase.execute({ deposit_id: depositId.toString(), email, role });
        res.status(201).json(invitedMember);
    }
    static async updateMember(req, res) {
        const { depositId, userId } = req.params;
        const { role } = req.body;
        const updatedMember = await updateMemberUseCase.execute({ deposit_id: depositId.toString(), user_id: userId.toString(), role });
        res.status(200).json(updatedMember);
    }
    static async deleteMember(req, res) {
        const { depositId, userId } = req.params;
        const deletedMember = await deleteMemberUseCase.execute({ deposit_id: depositId.toString(), user_id: userId.toString() });
        res.status(200).json(deletedMember);
    }
    static async acceptInvitation(req, res) {
        const { depositId } = req.params;
        const userId = req.user.id;
        const status = await acceptInvitationUseCase.execute({ deposit_id: depositId.toString(), user_id: userId.toString() });
        res.status(200).json({ message: status });
    }
    static async rejectInvitation(req, res) {
        const { depositId } = req.params;
        const userId = req.user.id;
        const status = await rejectInvitationUseCase.execute({ deposit_id: depositId.toString(), user_id: userId.toString() });
        res.status(200).json({ message: status });
    }
    static async getInvitations(req, res) {
        const userId = req.user.id;
        const invitations = await getInvitationUseCase.execute({ user_id: userId });
        res.status(200).json(invitations);
    }
    static async leaveDeposit(req, res) {
        const { depositId } = req.params;
        const userId = req.user.id;
        const deletedMember = await deleteMemberUseCase.execute({ deposit_id: depositId.toString(), user_id: userId.toString() });
        res.status(200).json(deletedMember);
    }
}
exports.TeamController = TeamController;
