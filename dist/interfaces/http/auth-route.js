"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRouter = AuthRouter;
const express_1 = require("express");
const auth_1 = __importDefault(require("../../infrastructure/middlewares/auth"));
function AuthRouter(deps) {
    const router = (0, express_1.Router)();
    router.post("/send-otp", async (req, res, next) => {
        try {
            const result = await deps.sendOtpUseCase.execute(req.body.email);
            return res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    });
    router.post("/verify-otp", async (req, res, next) => {
        try {
            const result = await deps.verifyOtpUseCase.execute(req.body.email, req.body.otp);
            return res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    });
    router.post("/signup", async (req, res, next) => {
        try {
            const user = await deps.signupUseCase.execute(req.body);
            return res.status(201).json(user);
        }
        catch (error) {
            next(error);
        }
    });
    router.post("/signin", async (req, res, next) => {
        try {
            const result = await deps.signinUseCase.execute(req.body);
            return res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    });
    router.put("/restore-password", async (req, res, next) => {
        try {
            const user = await deps.resetPasswordUseCase.execute(req.body);
            return res.status(200).json(user);
        }
        catch (error) {
            next(error);
        }
    });
    router.put("/update-user", auth_1.default, async (req, res, next) => {
        try {
            const user = await deps.updateUserUseCase.execute(req.body);
            return res.status(200).json(user);
        }
        catch (error) {
            next(error);
        }
    });
    router.delete("/delete-user", auth_1.default, async (req, res, next) => {
        try {
            const user = await deps.deleteUserUseCase.execute(req.body.email);
            return res.status(200).json(user);
        }
        catch (error) {
            next(error);
        }
    });
    return router;
}
exports.default = AuthRouter;
