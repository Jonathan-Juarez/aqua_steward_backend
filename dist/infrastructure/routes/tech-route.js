"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("../middlewares/auth"));
const authorize_1 = require("../middlewares/authorize");
const tech_controller_1 = require("../controllers/tech-controller");
const router = (0, express_1.Router)();
// Todas las rutas requieren token y rol de técnico
router.use(auth_1.default, authorize_1.requireTechnician);
router.get("/stats", tech_controller_1.TechController.getStats);
router.get("/users", tech_controller_1.TechController.getUsers);
exports.default = router;
