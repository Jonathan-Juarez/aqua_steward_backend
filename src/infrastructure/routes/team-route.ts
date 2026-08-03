import { Router } from "express";
import { TeamController } from "../controllers/team-controller";
import auth from "../middlewares/auth";
import { requireAdmin } from "../middlewares/authorize";

const router = Router();

router.get("/invitations", auth, TeamController.getInvitations);
router.get("/:depositId", auth, TeamController.getTeam);
router.post("/:depositId/invite", auth, requireAdmin, TeamController.inviteMember);
router.put("/:depositId/members/:userId", auth, requireAdmin, TeamController.updateMember);
router.delete("/:depositId/members/:userId", auth, requireAdmin, TeamController.deleteMember);
router.put("/:depositId/accept", auth, TeamController.acceptInvitation);
router.delete("/:depositId/reject", auth, TeamController.rejectInvitation);

export default router;
