"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireTechnician = exports.requireAdmin = exports.requireOwner = exports.authorizeRole = void 0;
const ForbiddenError_1 = require("../errors/ForbiddenError");
const UnauthorizedError_1 = require("../errors/UnauthorizedError");
const user_model_1 = __importDefault(require("../database/models/user-model"));
const deposit_model_1 = __importDefault(require("../database/models/deposit-model"));
// Middleware de autorización unificado (soporta rol global y roles por depósito)
const authorizeRole = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            const userId = req.user?.id;
            if (!userId)
                throw new UnauthorizedError_1.UnauthorizedError("Usuario no autenticado.");
            const user = await user_model_1.default.findById(userId);
            if (!user)
                throw new UnauthorizedError_1.UnauthorizedError("Usuario no encontrado.");
            // Si el rol global del usuario (ej: 'technician') está permitido, otorga acceso directo
            if (user.global_role && allowedRoles.includes(user.global_role)) {
                return next();
            }
            const depositId = req.params.depositId || req.params.id || req.body.deposit_id;
            if (!depositId)
                return next();
            // Verificación del creador directo del depósito
            const deposit = await deposit_model_1.default.findById(depositId);
            if (deposit && deposit.owner_id.toString() === userId.toString()) {
                return next();
            }
            // Verificación del rol asignado en el depósito
            const assignment = user.assigned_deposits?.find((a) => a.deposit_id?.toString() === depositId.toString() && a.status === "accepted");
            if (!assignment || !allowedRoles.includes(assignment.role)) {
                throw new ForbiddenError_1.ForbiddenError();
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.authorizeRole = authorizeRole;
// Aliases semánticos unificados
exports.requireOwner = (0, exports.authorizeRole)(['owner']);
exports.requireAdmin = (0, exports.authorizeRole)(['owner', 'admin']);
exports.requireTechnician = (0, exports.authorizeRole)(['technician']);
