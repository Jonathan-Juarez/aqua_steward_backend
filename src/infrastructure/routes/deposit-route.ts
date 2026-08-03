import { Router } from "express";
import { DepositController } from "../controllers/deposit-controller";
import auth from "../middlewares/auth";
import { requireOwner, requireAdmin } from "../middlewares/authorize";

const router = Router();

router.post("/createDeposit", auth, DepositController.createDeposit);
router.get("/getDeposits", auth, DepositController.getDeposits);
router.delete("/deleteDeposit/:id", auth, requireOwner, DepositController.deleteDeposit);
router.put("/updateDeposit/:id", auth, requireAdmin, DepositController.updateDeposit);

export default router;
