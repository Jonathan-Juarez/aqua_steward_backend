import { Router } from "express";
import auth from "../middlewares/auth";
import { requireTechnician } from "../middlewares/authorize";
import { TechController } from "../controllers/tech-controller";

const router = Router();

// Todas las rutas requieren token y rol de técnico
router.use(auth, requireTechnician);

router.get("/stats", TechController.getStats);
router.get("/users", TechController.getUsers);

export default router;
