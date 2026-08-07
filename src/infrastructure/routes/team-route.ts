import { Router } from "express";
import { TeamController } from "../controllers/team-controller";
import auth from "../middlewares/auth";
import { requireAdmin } from "../middlewares/authorize";

const router = Router();
router.use(auth);

router.get("/invitations", TeamController.getInvitations);
router.get("/:depositId", TeamController.getTeam);
router.post("/:depositId/invite", requireAdmin, TeamController.inviteMember);
router.put("/:depositId/members/:userId", requireAdmin, TeamController.updateMember);
router.delete("/:depositId/members/:userId", requireAdmin, TeamController.deleteMember);
router.put("/:depositId/accept", TeamController.acceptInvitation);
router.delete("/:depositId/reject", TeamController.rejectInvitation);

export default router;
