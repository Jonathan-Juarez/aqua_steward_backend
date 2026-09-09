"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errors = void 0;
const CustomError_1 = require("../errors/CustomError");
// Middleware global para el manejo de errores.
const errors = (e, req, res, next) => {
    // Se valida que sea un error controlado.
    if (e instanceof CustomError_1.CustomError) {
        return res.status(e.statusCode).json({
            errors: e.formatMessage(),
        });
    }
    if (e.name === "TokenExpiredError" || e.name === "JsonWebTokenError") {
        return res.status(401).json({
            errors: [{ message: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente." }],
        });
    }
    // Si el error no es controlado, se muestra uno genérico.
    console.error("Error inesperado:", e);
    return res.status(500).json({
        errors: [{ message: "Error interno del servidor" }],
    });
};
exports.errors = errors;
