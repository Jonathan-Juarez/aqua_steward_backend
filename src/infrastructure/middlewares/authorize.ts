import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";
import { ForbiddenError } from "../errors/ForbiddenError";
import { UnauthorizedError } from "../errors/UnauthorizedError";
import UserModel from "../database/models/user-model";
import DepositsModel from "../database/models/deposit-model";


// Middleware de autorización basado en roles.
export const authorizeRole = (allowedRoles: string[]) => {
    return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.id;
            if (!userId) throw new UnauthorizedError("Usuario no autenticado.");

            const depositId = req.params.depositId || req.params.id || req.body.deposit_id;
            if (!depositId) return next();

            // Se verifica si el usuario es el creador directo del depósito.
            const deposit = await DepositsModel.findById(depositId);
            if (deposit && deposit.owner_id.toString() === userId.toString()) {
                return next();
            }

            // Si no es el creador directo, se verifica su rol asignado en el depósito
            const user = await UserModel.findById(userId);
            if (!user) throw new UnauthorizedError("Usuario no encontrado.");

            const assignment = user.assigned_deposits?.find(
                (a) => a.deposit_id?.toString() === depositId.toString() && a.status === "accepted"
            );

            if (!assignment) throw new ForbiddenError("No tienes acceso a este depósito.");

            // Se verifica si el rol del usuario está permitido para la acción (gestionados en las rutas).
            if (!allowedRoles.includes(assignment.role)) {
                throw new ForbiddenError("No tienes permisos para realizar esta acción.");
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

// Aliases semánticos para uso en rutas
export const requireOwner = authorizeRole(['owner']);
export const requireAdmin = authorizeRole(['owner', 'admin']);
