"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepositRouter = DepositRouter;
const express_1 = require("express");
const auth_1 = __importDefault(require("../../infrastructure/middlewares/auth"));
const authorize_1 = require("../../infrastructure/middlewares/authorize");
function DepositRouter(deps) {
    const router = (0, express_1.Router)();
    router.use(auth_1.default);
    router.post("/createDeposit", async (req, res, next) => {
        try {
            const savedDeposit = await deps.createDepositUseCase.execute(req.body);
            return res.status(201).json(savedDeposit);
        }
        catch (error) {
            next(error);
        }
    });
    router.get("/getDeposits", async (req, res, next) => {
        try {
            const ownerId = String(req.user.id);
            const deposits = await deps.getDepositsUseCase.execute(ownerId);
            return res.status(200).json(deposits);
        }
        catch (error) {
            next(error);
        }
    });
    router.delete("/deleteDeposit/:id", authorize_1.requireOwner, async (req, res, next) => {
        try {
            const depositId = String(req.params.id);
            const deletedDeposit = await deps.deleteDepositUseCase.execute(depositId);
            return res.status(200).json(deletedDeposit);
        }
        catch (error) {
            next(error);
        }
    });
    router.put("/updateDeposit/:id", authorize_1.requireAdmin, async (req, res, next) => {
        try {
            const depositId = String(req.params.id);
            const updatedDeposit = await deps.updateDepositUseCase.execute(depositId, req.body);
            return res.status(200).json(updatedDeposit);
        }
        catch (error) {
            next(error);
        }
    });
    return router;
}
exports.default = DepositRouter;
