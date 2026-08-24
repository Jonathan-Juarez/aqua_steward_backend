"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth-controller");
const auth_1 = __importDefault(require("../middlewares/auth"));
const router = (0, express_1.Router)();
router.post("/send-otp", auth_controller_1.AuthController.sendOtp);
router.post("/verify-otp", auth_controller_1.AuthController.verifyOtp);
router.post("/signup", auth_controller_1.AuthController.signup);
router.post("/signin", auth_controller_1.AuthController.signin);
router.put("/restore-password", auth_controller_1.AuthController.resetPassword);
router.put("/update-user", auth_1.default, auth_controller_1.AuthController.updateUser);
router.delete("/delete-user", auth_1.default, auth_controller_1.AuthController.deleteUser);
exports.default = router;
