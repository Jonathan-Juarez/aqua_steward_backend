"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// Función para crear limitadores de tasa con cálculo de tiempo restante.
const createLimiter = (windowMs, max) => (0, express_rate_limit_1.default)({
    windowMs,
    max,
    // Custom handler para formato limpio y tiempo restante estimado.
    handler: (req, res) => {
        const resetTime = req.rateLimit?.resetTime;
        let timeStr = "unos minutos";
        if (resetTime) {
            const diffMs = resetTime.getTime() - Date.now();
            const totalSeconds = Math.max(0, Math.ceil(diffMs / 1000));
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            timeStr = minutes > 0 ? `${minutes} min y ${seconds} s` : `${seconds} s`;
        }
        res.status(429).json({
            errors: [{ message: `Demasiadas peticiones. Intenta de nuevo en ${timeStr}.` }]
        });
    }
});
exports.createLimiter = createLimiter;
