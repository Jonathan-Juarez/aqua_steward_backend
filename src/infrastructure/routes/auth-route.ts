import { Router } from "express";
import { AuthController } from "../controllers/auth-controller";

const router = Router();

router.post("/signup", AuthController.signup);
router.post("/signin", AuthController.signin);
router.put("/restore-password", AuthController.resetPassword);
router.put("/update-user", AuthController.updateUser);
router.delete("/delete-user", AuthController.deleteUser);

export default router;
