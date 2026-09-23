import { Router, Request, Response, NextFunction } from "express";
import auth, { AuthRequest } from "../../infrastructure/middlewares/auth";
import { requireAdmin } from "../../infrastructure/middlewares/authorize";
import { GetTeamUseCase } from "../../app/usecases/team/get-team.usecase";
import { InviteMemberUseCase } from "../../app/usecases/team/invite-member.usecase";
import { UpdateMemberUseCase } from "../../app/usecases/team/update-member.usecase";
import { DeleteMemberUseCase } from "../../app/usecases/team/delete-member.usecase";
import { AcceptInvitationUseCase } from "../../app/usecases/team/accept-invitation.usecase";
import { RejectInvitationUseCase } from "../../app/usecases/team/reject-invitation.usecase";
import { GetInvitationUseCase } from "../../app/usecases/team/get-invitation.usecase";

export interface TeamDependencies {
    getTeamUseCase: GetTeamUseCase;
    inviteMemberUseCase: InviteMemberUseCase;
    updateMemberUseCase: UpdateMemberUseCase;
    deleteMemberUseCase: DeleteMemberUseCase;
    acceptInvitationUseCase: AcceptInvitationUseCase;
    rejectInvitationUseCase: RejectInvitationUseCase;
    getInvitationUseCase: GetInvitationUseCase;
}

export function TeamRouter(deps: TeamDependencies): Router {
    const router = Router();
    router.use(auth);

    router.get("/invitations", async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            const invitations = await deps.getInvitationUseCase.execute({ user_id: userId });
            return res.status(200).json(invitations);
        } catch (error) {
            next(error);
        }
    });

    router.get("/:depositId", async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { depositId } = req.params;
            const team = await deps.getTeamUseCase.execute({ deposit_id: depositId.toString() });
            return res.status(200).json(team);
        } catch (error) {
            next(error);
        }
    });

    router.post("/:depositId/invite", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { depositId } = req.params;
            const { email, role } = req.body;
            const invitedMember = await deps.inviteMemberUseCase.execute({ deposit_id: depositId.toString(), email, role });
            return res.status(201).json(invitedMember);
        } catch (error) {
            next(error);
        }
    });

    router.put("/:depositId/members/:userId", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { depositId, userId } = req.params;
            const { role } = req.body;
            const updatedMember = await deps.updateMemberUseCase.execute({ deposit_id: depositId.toString(), user_id: userId.toString(), role });
            return res.status(200).json(updatedMember);
        } catch (error) {
            next(error);
        }
    });

    router.delete("/:depositId/members/:userId", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { depositId, userId } = req.params;
            const deletedMember = await deps.deleteMemberUseCase.execute({ deposit_id: depositId.toString(), user_id: userId.toString() });
            return res.status(200).json(deletedMember);
        } catch (error) {
            next(error);
        }
    });

    router.put("/:depositId/accept", async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const { depositId } = req.params;
            const userId = req.user.id;
            const status = await deps.acceptInvitationUseCase.execute({ deposit_id: depositId.toString(), user_id: userId.toString() });
            return res.status(200).json({ message: status });
        } catch (error) {
            next(error);
        }
    });

    router.delete("/:depositId/reject", async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const { depositId } = req.params;
            const userId = req.user.id;
            const status = await deps.rejectInvitationUseCase.execute({ deposit_id: depositId.toString(), user_id: userId.toString() });
            return res.status(200).json({ message: status });
        } catch (error) {
            next(error);
        }
    });

    router.delete("/:depositId/leave", async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const { depositId } = req.params;
            const userId = req.user.id;
            const deletedMember = await deps.deleteMemberUseCase.execute({ deposit_id: depositId.toString(), user_id: userId.toString() });
            return res.status(200).json(deletedMember);
        } catch (error) {
            next(error);
        }
    });

    return router;
}

export default TeamRouter;


