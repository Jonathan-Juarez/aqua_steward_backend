import { Router } from "express";
import { AuthController } from "../controllers/auth-controller";
import auth from "../middlewares/auth";

const router = Router();

router.post("/send-otp", AuthController.sendOtp);
router.post("/verify-otp", AuthController.verifyOtp);
router.post("/signup", AuthController.signup);
router.post("/signin", AuthController.signin);
router.put("/restore-password", AuthController.resetPassword);
router.put("/update-user", auth, AuthController.updateUser);
router.delete("/delete-user", auth, AuthController.deleteUser);

export default router;
