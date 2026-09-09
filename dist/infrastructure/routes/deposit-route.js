"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const deposit_controller_1 = require("../controllers/deposit-controller");
const auth_1 = __importDefault(require("../middlewares/auth"));
const authorize_1 = require("../middlewares/authorize");
const router = (0, express_1.Router)();
router.use(auth_1.default);
router.post("/createDeposit", deposit_controller_1.DepositController.createDeposit);
router.get("/getDeposits", deposit_controller_1.DepositController.getDeposits);
router.delete("/deleteDeposit/:id", authorize_1.requireOwner, deposit_controller_1.DepositController.deleteDeposit);
router.put("/updateDeposit/:id", authorize_1.requireAdmin, deposit_controller_1.DepositController.updateDeposit);
exports.default = router;
