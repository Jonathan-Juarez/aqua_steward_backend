import { Router } from "express";
import { TeamController } from "../controllers/team-controller";
import auth from "../middlewares/auth";

const router = Router();

router.get("/invitations", auth, TeamController.getInvitations);
router.get("/:depositId", auth, TeamController.getTeam);
router.post("/:depositId/invite", auth, TeamController.inviteMember);
router.put("/:depositId/members/:userId", auth, TeamController.updateMember);
router.delete("/:depositId/members/:userId", auth, TeamController.deleteMember);
router.put("/:depositId/accept", auth, TeamController.acceptInvitation);
router.delete("/:depositId/reject", auth, TeamController.rejectInvitation);

export default router;
