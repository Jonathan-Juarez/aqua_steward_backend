import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";
import { ForbiddenError } from "../errors/ForbiddenError";
import { UnauthorizedError } from "../errors/UnauthorizedError";
import UserModel from "../database/models/user-model";
import DepositsModel from "../database/models/deposit-model";

// Middleware de autorización unificado (soporta rol global y roles por depósito)
export const authorizeRole = (allowedRoles: string[]) => {
    return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.id;
            if (!userId) throw new UnauthorizedError("Usuario no autenticado.");

            const user = await UserModel.findById(userId);
            if (!user) throw new UnauthorizedError("Usuario no encontrado.");

            // Si el rol global del usuario (ej: 'technician') está permitido, otorga acceso directo
            if (user.global_role && allowedRoles.includes(user.global_role)) {
                return next();
            }

            const depositId = req.params.depositId || req.params.id || req.body.deposit_id;
            if (!depositId) return next();

            // Verificación del creador directo del depósito
            const deposit = await DepositsModel.findById(depositId);
            if (deposit && deposit.owner_id.toString() === userId.toString()) {
                return next();
            }

            // Verificación del rol asignado en el depósito
            const assignment = user.assigned_deposits?.find(
                (a) => a.deposit_id?.toString() === depositId.toString() && a.status === "accepted"
            );

            if (!assignment || !allowedRoles.includes(assignment.role)) {
                throw new ForbiddenError("No tienes permisos para realizar esta acción.");
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

// Aliases semánticos unificados
export const requireOwner = authorizeRole(['owner']);
export const requireAdmin = authorizeRole(['owner', 'admin']);
export const requireTechnician = authorizeRole(['technician']);
