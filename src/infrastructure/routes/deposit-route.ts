import { Router } from "express";
import { createDeposit, getDeposits, deleteDeposit, updateDeposit } from "../controllers/deposit-controller";
import auth from "../middlewares/auth";

const router = Router();

router.post("/createDeposit", auth, createDeposit);
router.get("/getDeposits", auth, getDeposits);
router.delete("/deleteDeposit/:id", auth, deleteDeposit);
router.put("/updateDeposit/:id", auth, updateDeposit);

export default router;
