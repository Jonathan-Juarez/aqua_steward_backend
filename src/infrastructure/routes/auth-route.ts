import { Router } from "express";
import { signup, signin, resetPassword, updateUser } from "../controllers/auth-controller";

const router = Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.put("/restore-password", resetPassword);
router.put("/update-user", updateUser);

export default router;
