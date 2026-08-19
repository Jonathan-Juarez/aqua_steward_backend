import { Request, Response } from "express";
import { GetTeamUseCase } from "../../app/usecases/team/get-team.usecase";
import { InviteMemberUseCase } from "../../app/usecases/team/invite-member.usecase";
import { UpdateMemberUseCase } from "../../app/usecases/team/update-member.usecase";
import { DeleteMemberUseCase } from "../../app/usecases/team/delete-member.usecase";
import { AcceptInvitationUseCase } from "../../app/usecases/team/accept-invitation.usecase";
import { RejectInvitationUseCase } from "../../app/usecases/team/reject-invitation.usecase";
import { GetInvitationUseCase } from "../../app/usecases/team/get-invitation.usecase";
import { TeamRepositoryMongo } from "../database/repositories/team-repository.mongo";
import MongoAuthRepository from "../database/repositories/auth-repository.mongo";
import DepositRepositoryMongo from "../database/repositories/deposit-repository.mongo";
import { AuthRequest } from "../middlewares/auth";

const teamRepository = new TeamRepositoryMongo();
const authRepository = new MongoAuthRepository();
const depositRepository = new DepositRepositoryMongo();
const getTeamUseCase = new GetTeamUseCase(teamRepository);
const inviteMemberUseCase = new InviteMemberUseCase(teamRepository, authRepository, depositRepository);
const updateMemberUseCase = new UpdateMemberUseCase(teamRepository, authRepository, depositRepository);
const deleteMemberUseCase = new DeleteMemberUseCase(teamRepository, authRepository, depositRepository);
const acceptInvitationUseCase = new AcceptInvitationUseCase(teamRepository, authRepository);
const rejectInvitationUseCase = new RejectInvitationUseCase(teamRepository, authRepository);
const getInvitationUseCase = new GetInvitationUseCase(teamRepository, authRepository);

export class TeamController {
    static async getTeam(req: Request, res: Response) {
        const { depositId } = req.params;
        const team = await getTeamUseCase.execute({ deposit_id: depositId.toString() });
        res.status(200).json(team);
    }

    static async inviteMember(req: Request, res: Response) {
        const { depositId } = req.params;
        const { email, role } = req.body;
        const invitedMember = await inviteMemberUseCase.execute({ deposit_id: depositId.toString(), email, role });
        res.status(201).json(invitedMember);
    }

    static async updateMember(req: Request, res: Response) {
        const { depositId, userId } = req.params;
        const { role } = req.body;
        const updatedMember = await updateMemberUseCase.execute({ deposit_id: depositId.toString(), user_id: userId.toString(), role });
        res.status(200).json(updatedMember);
    }

    static async deleteMember(req: Request, res: Response) {
        const { depositId, userId } = req.params;
        const deletedMember = await deleteMemberUseCase.execute({ deposit_id: depositId.toString(), user_id: userId.toString() });
        res.status(200).json(deletedMember);
    }

    static async acceptInvitation(req: AuthRequest, res: Response) {
        const { depositId } = req.params;
        const userId = req.user.id;
        const status = await acceptInvitationUseCase.execute({ deposit_id: depositId.toString(), user_id: userId.toString() });
        res.status(200).json({ message: status });
    }

    static async rejectInvitation(req: AuthRequest, res: Response) {
        const { depositId } = req.params;
        const userId = req.user.id;
        const status = await rejectInvitationUseCase.execute({ deposit_id: depositId.toString(), user_id: userId.toString() });
        res.status(200).json({ message: status });
    }

    static async getInvitations(req: AuthRequest, res: Response) {
        const userId = req.user.id;
        const invitations = await getInvitationUseCase.execute({ user_id: userId });
        res.status(200).json(invitations);
    }

    static async leaveDeposit(req: AuthRequest, res: Response) {
        const { depositId } = req.params;
        const userId = req.user.id;
        const deletedMember = await deleteMemberUseCase.execute({ deposit_id: depositId.toString(), user_id: userId.toString() });
        res.status(200).json(deletedMember);
    }
}
