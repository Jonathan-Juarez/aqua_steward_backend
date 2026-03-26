import { Router } from "express";
import { createDeposit, getDeposits, deleteDeposit } from "../controllers/deposit-controller";
import auth from "../middlewares/auth";

const router = Router();

router.post("/createDeposit", auth, createDeposit);
router.get("/getDeposits", auth, getDeposits);
router.delete("/deleteDeposit/:id", auth, deleteDeposit);

export default router;
