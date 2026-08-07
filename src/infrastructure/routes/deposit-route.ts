import { Router } from "express";
import { DepositController } from "../controllers/deposit-controller";
import auth from "../middlewares/auth";
import { requireOwner, requireAdmin } from "../middlewares/authorize";

const router = Router();
router.use(auth);

router.post("/createDeposit", DepositController.createDeposit);
router.get("/getDeposits", DepositController.getDeposits);
router.delete("/deleteDeposit/:id", requireOwner, DepositController.deleteDeposit);
router.put("/updateDeposit/:id", requireAdmin, DepositController.updateDeposit);

export default router;
