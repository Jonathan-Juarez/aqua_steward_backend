"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamRouter = TeamRouter;
const express_1 = require("express");
const auth_1 = __importDefault(require("../../infrastructure/middlewares/auth"));
const authorize_1 = require("../../infrastructure/middlewares/authorize");
function TeamRouter(deps) {
    const router = (0, express_1.Router)();
    router.use(auth_1.default);
    router.get("/invitations", async (req, res, next) => {
        try {
            const userId = req.user.id;
            const invitations = await deps.getInvitationUseCase.execute({ user_id: userId });
            return res.status(200).json(invitations);
        }
        catch (error) {
            next(error);
        }
    });
    router.get("/:depositId", async (req, res, next) => {
        try {
            const { depositId } = req.params;
            const team = await deps.getTeamUseCase.execute({ deposit_id: depositId.toString() });
            return res.status(200).json(team);
        }
        catch (error) {
            next(error);
        }
    });
    router.post("/:depositId/invite", authorize_1.requireAdmin, async (req, res, next) => {
        try {
            const { depositId } = req.params;
            const { email, role } = req.body;
            const invitedMember = await deps.inviteMemberUseCase.execute({ deposit_id: depositId.toString(), email, role });
            return res.status(201).json(invitedMember);
        }
        catch (error) {
            next(error);
        }
    });
    router.put("/:depositId/members/:userId", authorize_1.requireAdmin, async (req, res, next) => {
        try {
            const { depositId, userId } = req.params;
            const { role } = req.body;
            const updatedMember = await deps.updateMemberUseCase.execute({ deposit_id: depositId.toString(), user_id: userId.toString(), role });
            return res.status(200).json(updatedMember);
        }
        catch (error) {
            next(error);
        }
    });
    router.delete("/:depositId/members/:userId", authorize_1.requireAdmin, async (req, res, next) => {
        try {
            const { depositId, userId } = req.params;
            const deletedMember = await deps.deleteMemberUseCase.execute({ deposit_id: depositId.toString(), user_id: userId.toString() });
            return res.status(200).json(deletedMember);
        }
        catch (error) {
            next(error);
        }
    });
    router.put("/:depositId/accept", async (req, res, next) => {
        try {
            const { depositId } = req.params;
            const userId = req.user.id;
            const status = await deps.acceptInvitationUseCase.execute({ deposit_id: depositId.toString(), user_id: userId.toString() });
            return res.status(200).json({ message: status });
        }
        catch (error) {
            next(error);
        }
    });
    router.delete("/:depositId/reject", async (req, res, next) => {
        try {
            const { depositId } = req.params;
            const userId = req.user.id;
            const status = await deps.rejectInvitationUseCase.execute({ deposit_id: depositId.toString(), user_id: userId.toString() });
            return res.status(200).json({ message: status });
        }
        catch (error) {
            next(error);
        }
    });
    router.delete("/:depositId/leave", async (req, res, next) => {
        try {
            const { depositId } = req.params;
            const userId = req.user.id;
            const deletedMember = await deps.deleteMemberUseCase.execute({ deposit_id: depositId.toString(), user_id: userId.toString() });
            return res.status(200).json(deletedMember);
        }
        catch (error) {
            next(error);
        }
    });
    return router;
}
exports.default = TeamRouter;
