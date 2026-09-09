"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const UnauthorizedError_1 = require("../errors/UnauthorizedError");
// Middleware de autenticación para verificar el token.
const auth = (req, res, next) => {
    try {
        const token = req.header("x-auth-token");
        if (!token) {
            throw new UnauthorizedError_1.UnauthorizedError("No se proporcionó un token.");
        }
        try {
            const verified = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            if (!verified) {
                throw new UnauthorizedError_1.UnauthorizedError("La verificación del token falló.");
            }
            req.user = verified;
            next();
        }
        catch (jwtErr) {
            if (jwtErr.name === "TokenExpiredError") {
                throw new UnauthorizedError_1.UnauthorizedError("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
            }
            throw new UnauthorizedError_1.UnauthorizedError("El token de autenticación no es válido.");
        }
    }
    catch (e) {
        next(e); // Se delega al middleware global de errores.
    }
};
exports.default = auth;
