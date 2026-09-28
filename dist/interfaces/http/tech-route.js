"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TechRouter = TechRouter;
const express_1 = require("express");
const auth_1 = __importDefault(require("../../infrastructure/middlewares/auth"));
const authorize_1 = require("../../infrastructure/middlewares/authorize");
function TechRouter(deps) {
    const router = (0, express_1.Router)();
    // Todas las rutas requieren token y rol de técnico
    router.use(auth_1.default, authorize_1.requireTechnician);
    router.get("/stats", async (req, res, next) => {
        try {
            const stats = await deps.getSystemStatsUseCase.execute();
            return res.status(200).json(stats);
        }
        catch (error) {
            next(error);
        }
    });
    router.get("/users", async (req, res, next) => {
        try {
            const users = await deps.getAllUsersTechUseCase.execute();
            return res.status(200).json(users);
        }
        catch (error) {
            next(error);
        }
    });
    return router;
}
exports.default = TechRouter;
