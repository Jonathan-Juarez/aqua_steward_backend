import { Router } from "express";
import { signup, signin, restorePassword } from "../controllers/auth-controller";

const router = Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.put("/restore-password", restorePassword);

export default router;
